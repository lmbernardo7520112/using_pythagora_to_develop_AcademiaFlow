// server/services/secretariaService.ts

import mongoose from "mongoose";
import Turma from "../models/Turma.js";
import Aluno from "../models/Aluno.js";
import { getGradesByTurmaAndDisciplina } from "./gradeService.js";

/**
 * Secretaria service — usa apenas modelos existentes e funções nomeadas do gradeService.
 * Todas as operações são aditivas (não modificam schemas existentes).
 */
const secretariaService = {
  // -------------------- TURMAS --------------------
  async listTurmas() {
    try {
      return await Turma.find({ ativo: true })
        .populate("professor", "name email role")
        .populate("disciplinas", "nome")
        .lean();
    } catch (error) {
      console.error("secretariaService.listTurmas:", error);
      throw new Error("Erro ao listar turmas");
    }
  },

  async getTurmaById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      return await Turma.findById(id)
        .populate("professor", "name email")
        .populate("disciplinas", "nome")
        .populate("alunos", "nome matricula email ativo")
        .lean();
    } catch (error) {
      console.error("secretariaService.getTurmaById:", error);
      throw new Error("Erro ao obter turma");
    }
  },

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
      console.error("secretariaService.createTurma:", error);
      throw new Error("Erro ao criar turma");
    }
  },

  async updateTurma(id: string, data: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      const updated = await Turma.findByIdAndUpdate(id, data, { new: true });
      if (!updated) throw new Error("Turma não encontrada");
      return updated;
    } catch (error) {
      console.error("secretariaService.updateTurma:", error);
      throw new Error("Erro ao atualizar turma");
    }
  },

  async disableTurma(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      const turma = await Turma.findById(id);
      if (!turma) throw new Error("Turma não encontrada");

      turma.ativo = false;
      await turma.save();

      // Desativa alunos vinculados
      await Aluno.updateMany({ turma: id }, { ativo: false });
    } catch (error) {
      console.error("secretariaService.disableTurma:", error);
      throw new Error("Erro ao desativar turma");
    }
  },

  // -------------------- ALUNOS --------------------
  async listAlunosByTurma(turmaId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");
      return await Aluno.find({ turma: turmaId }).sort({ nome: 1 }).lean();
    } catch (error) {
      console.error("secretariaService.listAlunosByTurma:", error);
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

      const novo = await Aluno.create({ ...data, turma: turma._id, ativo: true });
      turma.alunos.push(novo._id as mongoose.Types.ObjectId);
      await turma.save();

      return novo;
    } catch (error) {
      console.error("secretariaService.createAluno:", error);
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
      console.error("secretariaService.updateAluno:", error);
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
      console.error("secretariaService.disableAluno:", error);
      throw new Error("Erro ao desativar aluno");
    }
  },

  // -------------------- DASHBOARD / TAXAS --------------------
  async getDashboardGeral() {
    try {
      // Contagens básicas
      const totalTurmas = await Turma.countDocuments({ ativo: true });
      const totalAlunos = await Aluno.countDocuments();

      // Contagens detalhadas
      const ativos = await Aluno.countDocuments({ ativo: true });
      const transferidos = await Aluno.countDocuments({ transferido: true });
      const desistentes = await Aluno.countDocuments({ desistente: true });

      // Abandonos = inativos que não são transferidos nem desistentes
      const abandonos = await Aluno.countDocuments({
        ativo: false,
        transferido: { $ne: true },
        desistente: { $ne: true },
      });

      return {
        totalTurmas,
        totalAlunos,
        ativos,
        transferidos,
        desistentes,
        abandonos,
      };
    } catch (error) {
      console.error("secretariaService.getDashboardGeral:", error);
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
      console.error("secretariaService.getDashboardTurma:", error);
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
      console.error("secretariaService.getTaxasAprovacao:", error);
      throw new Error("Erro ao calcular taxas de aprovação");
    }
  },
};

export default secretariaService;
