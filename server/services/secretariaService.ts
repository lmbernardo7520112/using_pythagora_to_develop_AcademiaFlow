// server/services/secretariaService.ts

import mongoose from "mongoose";
import Turma from "../models/Turma.js";
import Aluno from "../models/Aluno.js";
import Disciplina from "../models/Disciplina.js";
import { getGradesByTurmaAndDisciplina } from "./gradeService.js";

/**
 * Secretaria service — operações administrativas de alto nível.
 * Preserva compatibilidade total com os fluxos existentes (frontend e backend).
 */
const secretariaService = {
  // ==========================================================
  // 🎓 TURMAS
  // ==========================================================

  /**
   * Lista todas as turmas ativas, exibindo apenas dados neutros
   * (sem professor) e com as disciplinas vinculadas.
   */
  async listTurmas() {
    try {
      const turmas = await Turma.find({ ativo: true })
        .populate({ path: "disciplinas", select: "nome codigo" })
        .select("nome ano disciplinas ativo")
        .lean();

      return turmas.map((t: any) => ({
        _id: t._id,
        nome: t.nome ?? "(Sem nome)",
        ano: t.ano ?? new Date().getFullYear(),
        disciplinas: Array.isArray(t.disciplinas) ? t.disciplinas : [],
        ativo: t.ativo !== false,
      }));
    } catch (error) {
      console.error("❌ secretariaService.listTurmas:", error);
      throw new Error("Erro ao listar turmas");
    }
  },

  /**
   * Retorna uma turma específica com seus alunos e disciplinas.
   */
  async getTurmaById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      return await Turma.findById(id)
        .populate("disciplinas", "nome codigo")
        .populate("alunos", "nome matricula email ativo transferido desistente")
        .lean();
    } catch (error) {
      console.error("❌ secretariaService.getTurmaById:", error);
      throw new Error("Erro ao obter turma");
    }
  },

  /**
   * Cria uma nova turma com disciplinas e professor.
   * Mantém compatibilidade retroativa com as rotas existentes.
   */
  async createTurma(data: any) {
    try {
      if (!data.nome || !data.ano || !data.professor || !data.disciplinas) {
        throw new Error("Campos obrigatórios: nome, ano, professor, disciplinas");
      }

      const exists = await Turma.findOne({ nome: data.nome, ano: data.ano });
      if (exists) throw new Error("Já existe turma com mesmo nome e ano");

      const nova = new Turma({
        nome: data.nome,
        ano: data.ano,
        professor: data.professor,
        disciplinas: data.disciplinas,
        alunos: [],
        ativo: true,
      });

      return await nova.save();
    } catch (error) {
      console.error("❌ secretariaService.createTurma:", error);
      throw new Error("Erro ao criar turma");
    }
  },

  /**
   * Atualiza dados de uma turma existente.
   */
  async updateTurma(id: string, data: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      const updated = await Turma.findByIdAndUpdate(id, data, { new: true });
      if (!updated) throw new Error("Turma não encontrada");
      return updated;
    } catch (error) {
      console.error("❌ secretariaService.updateTurma:", error);
      throw new Error("Erro ao atualizar turma");
    }
  },

  /**
   * Desativa uma turma e seus alunos vinculados.
   */
  async disableTurma(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      const turma = await Turma.findById(id);
      if (!turma) throw new Error("Turma não encontrada");

      turma.ativo = false;
      await turma.save();

      await Aluno.updateMany({ turma: id }, { ativo: false });
    } catch (error) {
      console.error("❌ secretariaService.disableTurma:", error);
      throw new Error("Erro ao desativar turma");
    }
  },

  // ==========================================================
  // 👩‍🎓 ALUNOS
  // ==========================================================
  async listAlunosByTurma(turmaId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");
      return await Aluno.find({ turma: turmaId })
        .select("nome matricula email ativo transferido desistente")
        .sort({ nome: 1 })
        .lean();
    } catch (error) {
      console.error("❌ secretariaService.listAlunosByTurma:", error);
      throw new Error("Erro ao listar alunos");
    }
  },

  async createAluno(turmaId: string, data: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");
      const turma = await Turma.findById(turmaId);
      if (!turma) throw new Error("Turma não encontrada");

      if (!data.nome || !data.matricula || !data.email) {
        throw new Error("Campos obrigatórios: nome, matrícula, email");
      }

      const exists = await Aluno.findOne({
        $or: [{ matricula: data.matricula }, { email: data.email }],
      });
      if (exists) throw new Error("Matrícula ou e-mail já cadastrados");

      const novo = await Aluno.create({
        ...data,
        turma: turma._id,
        ativo: true,
        transferido: false,
        desistente: false,
      });

      turma.alunos.push(novo._id as mongoose.Types.ObjectId);
      await turma.save();

      return novo;
    } catch (error) {
      console.error("❌ secretariaService.createAluno:", error);
      throw new Error("Erro ao criar aluno");
    }
  },

  async updateAluno(id: string, data: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      const updated = await Aluno.findByIdAndUpdate(id, data, { new: true });
      if (!updated) throw new Error("Aluno não encontrado");
      return updated;
    } catch (error) {
      console.error("❌ secretariaService.updateAluno:", error);
      throw new Error("Erro ao atualizar aluno");
    }
  },

  async disableAluno(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      const aluno = await Aluno.findById(id);
      if (!aluno) throw new Error("Aluno não encontrado");
      aluno.ativo = false;
      await aluno.save();
    } catch (error) {
      console.error("❌ secretariaService.disableAluno:", error);
      throw new Error("Erro ao desativar aluno");
    }
  },

  // ==========================================================
  // 📊 DASHBOARD / TAXAS
  // ==========================================================
  async getDashboardGeral() {
    try {
      const totalTurmas = await Turma.countDocuments({ ativo: true });
      const totalAlunos = await Aluno.countDocuments();
      const ativos = await Aluno.countDocuments({ ativo: true });
      const inativos = await Aluno.countDocuments({ ativo: false });

      // Mantém compatibilidade com estrutura esperada pelo frontend
      const transferidos = 0;
      const desistentes = 0;
      const abandonos = inativos;

      return { totalTurmas, totalAlunos, ativos, transferidos, desistentes, abandonos };
    } catch (error) {
      console.error("❌ secretariaService.getDashboardGeral:", error);
      throw new Error("Erro ao gerar dashboard");
    }
  },

  async getDashboardTurma(turmaId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");
      const turma = await Turma.findById(turmaId).populate("alunos").lean();
      if (!turma) throw new Error("Turma não encontrada");

      const total = turma.alunos?.length || 0;
      const ativos = turma.alunos?.filter((a: any) => a.ativo).length || 0;
      const inativos = total - ativos;

      return { turma: turma.nome, total, ativos, inativos };
    } catch (error) {
      console.error("❌ secretariaService.getDashboardTurma:", error);
      throw new Error("Erro ao gerar dashboard da turma");
    }
  },

  async getTaxasAprovacao(bimestre?: number) {
    try {
      const turmas = await Turma.find({ ativo: true }).lean();
      const resultado: Record<string, any> = {};

      for (const turma of turmas) {
        if (!turma.disciplinas || turma.disciplinas.length === 0) continue;
        const disciplinaId = turma.disciplinas[0].toString();

        const grades = await getGradesByTurmaAndDisciplina(
          turma._id.toString(),
          disciplinaId
        );

        const total = grades.length;
        const aprovados = grades.filter((g: any) => g.situacao === "Aprovado").length;
        const reprovados = total - aprovados;

        resultado[turma.nome] = {
          total,
          aprovados,
          reprovados,
          taxa: total > 0 ? ((aprovados / total) * 100).toFixed(1) + "%" : "0%",
        };
      }

      return {
        referencia: bimestre ? `Bimestre ${bimestre}` : "Geral",
        turmas: resultado,
      };
    } catch (error) {
      console.error("❌ secretariaService.getTaxasAprovacao:", error);
      throw new Error("Erro ao calcular taxas de aprovação");
    }
  },

  // ==========================================================
  // 📚 DISCIPLINAS
  // ==========================================================
  async listDisciplinas() {
    try {
      const disciplinas = await Disciplina.find()
        .populate("professor", "nome email role")
        .populate("turma", "nome ano")
        .sort({ nome: 1 })
        .lean();

      return disciplinas.map((d: any) => ({
        _id: d._id,
        nome: d.nome,
        codigo: d.codigo,
        cargaHoraria: d.cargaHoraria ?? 0,
        ativo: d.ativo !== false,
        professor: d.professor
          ? {
              _id: d.professor._id,
              nome: d.professor.nome,
              email: d.professor.email,
            }
          : null,
        turma: d.turma
          ? {
              _id: d.turma._id,
              nome: d.turma.nome,
              ano: d.turma.ano,
            }
          : null,
      }));
    } catch (error) {
      console.error("❌ secretariaService.listDisciplinas:", error);
      throw new Error("Erro ao listar disciplinas");
    }
  },
};

export default secretariaService;
