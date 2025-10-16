// server/services/secretariaService.ts

import mongoose from "mongoose";
import Turma from "../models/Turma.js";
import Aluno from "../models/Aluno.js";
import Disciplina from "../models/Disciplina.js";
import { getGradesByTurmaAndDisciplina } from "./gradeService.js";

/**
<<<<<<< HEAD
 * Normaliza o payload de status para manter exclusividade e coerência:
 * - Se transferido = true => desistente = false, ativo = false
 * - Se desistente = true  => transferido = false, ativo = false
 * - Se ativo = true        => transferido = false, desistente = false
 * - Se nada explícito, mantém valores atuais do doc (quando possível)
=======
 * Secretaria service — operações administrativas de alto nível.
 * Preserva compatibilidade total com os fluxos existentes (frontend e backend).
>>>>>>> feature/prd003-secretary-class-view-refactor
 */
function normalizeAlunoStatus(
  current: any,
  patch: Partial<{ ativo: boolean; transferido: boolean; desistente: boolean }>
) {
  const out = {
    ativo: current?.ativo ?? true,
    transferido: current?.transferido ?? false,
    desistente: current?.desistente ?? false,
  };

  if (typeof patch.ativo === "boolean") out.ativo = patch.ativo;
  if (typeof patch.transferido === "boolean") out.transferido = patch.transferido;
  if (typeof patch.desistente === "boolean") out.desistente = patch.desistente;

  if (out.transferido) {
    out.desistente = false;
    out.ativo = false;
  } else if (out.desistente) {
    out.transferido = false;
    out.ativo = false;
  } else if (out.ativo) {
    out.transferido = false;
    out.desistente = false;
  }

  return out;
}

const secretariaService = {
  // ==========================================================
  // 🎓 TURMAS
  // ==========================================================

  async listTurmas() {
    try {
<<<<<<< HEAD
      const turmas = await Turma.find()
        .populate("professor", "name email role")
        .populate("disciplinas", "nome")
        .lean();

      if (!turmas || turmas.length === 0) return [];

=======
      const turmas = await Turma.find({ ativo: true })
        .populate({ path: "disciplinas", select: "nome codigo" })
        .select("nome ano disciplinas ativo")
        .lean();

>>>>>>> feature/prd003-secretary-class-view-refactor
      return turmas.map((t: any) => ({
        _id: t._id,
        nome: t.nome ?? "(Sem nome)",
        ano: t.ano ?? new Date().getFullYear(),
<<<<<<< HEAD
        professor: t.professor ?? null,
        disciplinas: Array.isArray(t.disciplinas) ? t.disciplinas : [],
        alunos: Array.isArray(t.alunos) ? t.alunos : [],
=======
        disciplinas: Array.isArray(t.disciplinas) ? t.disciplinas : [],
>>>>>>> feature/prd003-secretary-class-view-refactor
        ativo: t.ativo !== false,
      }));
    } catch (error) {
      console.error("❌ secretariaService.listTurmas:", error);
<<<<<<< HEAD
      return [];
=======
      throw new Error("Erro ao listar turmas");
>>>>>>> feature/prd003-secretary-class-view-refactor
    }
  },

  async getTurmaById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
<<<<<<< HEAD
      const turma = await Turma.findById(id)
        .populate("professor", "name email")
        .populate("disciplinas", "nome")
=======
      return await Turma.findById(id)
        .populate("disciplinas", "nome codigo")
>>>>>>> feature/prd003-secretary-class-view-refactor
        .populate("alunos", "nome matricula email ativo transferido desistente")
        .lean();

      return turma ?? null;
    } catch (error) {
      console.error("❌ secretariaService.getTurmaById:", error);
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
      console.error("❌ secretariaService.createTurma:", error);
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
      console.error("❌ secretariaService.updateTurma:", error);
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

<<<<<<< HEAD
      await Aluno.updateMany({ turma: id }, { $set: { ativo: false } }, { strict: false });
=======
      await Aluno.updateMany({ turma: id }, { ativo: false });
>>>>>>> feature/prd003-secretary-class-view-refactor
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
<<<<<<< HEAD
        .select("nome matricula email ativo transferido desistente turma")
=======
        .select("nome matricula email ativo transferido desistente")
>>>>>>> feature/prd003-secretary-class-view-refactor
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

  /**
   * Atualiza dados de um aluno e normaliza status (ativo, transferido, desistente)
   */
  async updateAluno(id: string, data: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");

<<<<<<< HEAD
      const current = await Aluno.findById(id).lean();
      if (!current) throw new Error("Aluno não encontrado");

      const normalized = normalizeAlunoStatus(current, {
        ativo: data.ativo,
        transferido: data.transferido,
        desistente: data.desistente,
      });

      await Aluno.updateOne(
        { _id: id },
        {
          $set: {
            ativo: normalized.ativo,
            transferido: normalized.transferido,
            desistente: normalized.desistente,
            ...(data.nome ? { nome: data.nome } : {}),
            ...(data.email ? { email: data.email } : {}),
          },
        },
        { strict: false, runValidators: false }
      );

      const updated = await Aluno.findById(id)
        .select("nome matricula email ativo transferido desistente turma")
        .lean();

      if (!updated) throw new Error("Aluno não encontrado após atualização");
=======
      // 🔹 Normalização de status
      const normalizeStatus = (dados: any) => {
        const status = { ativo: false, transferido: false, desistente: false };
        if (dados.transferido) status.transferido = true;
        else if (dados.desistente) status.desistente = true;
        else status.ativo = true;
        return status;
      };

      const statusAtualizado = normalizeStatus(data);

      const updated = await Aluno.findByIdAndUpdate(
        id,
        { ...data, ...statusAtualizado },
        { new: true }
      );

      if (!updated) throw new Error("Aluno não encontrado");
>>>>>>> feature/prd003-secretary-class-view-refactor
      return updated;
    } catch (error) {
      console.error("❌ secretariaService.updateAluno:", error);
      throw new Error("Erro ao atualizar aluno");
    }
  },

  async disableAluno(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      await Aluno.updateOne({ _id: id }, { $set: { ativo: false } }, { strict: false });
      const updated = await Aluno.findById(id)
        .select("nome matricula email ativo transferido desistente turma")
        .lean();
      return updated;
    } catch (error) {
      console.error("❌ secretariaService.disableAluno:", error);
      throw new Error("Erro ao desativar aluno");
    }
  },

  // ==========================================================
<<<<<<< HEAD
  // 📚 DISCIPLINAS — novas funcionalidades
  // ==========================================================
  async listDisciplinas() {
    try {
      const disciplinas = await Disciplina.find()
        .populate("professor", "nome email role")
        .sort({ nome: 1 })
        .lean();
      return disciplinas;
    } catch (error) {
      console.error("secretariaService.listDisciplinas:", error);
      throw new Error("Erro ao listar disciplinas");
    }
  },

  async assignProfessorToDisciplina(disciplinaId: string, professorId: string | null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(disciplinaId)) throw new Error("ID inválido");

      const disciplina = await Disciplina.findByIdAndUpdate(
        disciplinaId,
        { professor: professorId || null },
        { new: true }
      ).populate("professor", "nome email");

      if (!disciplina) throw new Error("Disciplina não encontrada");
      return disciplina;
    } catch (error) {
      console.error("secretariaService.assignProfessorToDisciplina:", error);
      throw new Error("Erro ao atribuir professor à disciplina");
    }
  },

  async updateAlunosInTurma(turmaId: string, alunosIds: string[]) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");
      const turma = await Turma.findById(turmaId);
      if (!turma) throw new Error("Turma não encontrada");

      // ✅ Conversão de string[] para ObjectId[]
      const objectIdList = alunosIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      turma.alunos = objectIdList;
      await turma.save();

      const updated = await Turma.findById(turmaId)
        .populate("alunos", "nome email matricula ativo transferido desistente")
        .lean();

      return updated;
    } catch (error) {
      console.error("secretariaService.updateAlunosInTurma:", error);
      throw new Error("Erro ao atualizar alunos da turma");
    }
  },

  // -------------------- DASHBOARD / TAXAS --------------------
=======
  // 📊 DASHBOARD / TAXAS
  // ==========================================================

>>>>>>> feature/prd003-secretary-class-view-refactor
  async getDashboardGeral() {
    try {
      const totalTurmas = await Turma.countDocuments({ ativo: true });
      const totalAlunos = await Aluno.countDocuments();
      const ativos = await Aluno.countDocuments({ ativo: true });
      const transferidos = await Aluno.countDocuments({ transferido: true });
      const desistentes = await Aluno.countDocuments({ desistente: true });
<<<<<<< HEAD
      const abandonos = await Aluno.countDocuments({
        ativo: false,
        transferido: { $ne: true },
        desistente: { $ne: true },
      });
=======
      const abandonos = await Aluno.countDocuments({ ativo: false });
>>>>>>> feature/prd003-secretary-class-view-refactor

      return { totalTurmas, totalAlunos, ativos, transferidos, desistentes, abandonos };
    } catch (error) {
      console.error("❌ secretariaService.getDashboardGeral:", error);
      throw new Error("Erro ao gerar dashboard");
    }
  },

  async getDashboardTurma(turmaId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");
      const turma = await Turma.findById(turmaId)
        .populate("alunos", "ativo transferido desistente")
        .lean();
      if (!turma) throw new Error("Turma não encontrada");

<<<<<<< HEAD
      const total = (turma.alunos as any[])?.length || 0;
      const ativos = (turma.alunos as any[])?.filter((a: any) => a.ativo).length || 0;
      const transferidos = (turma.alunos as any[])?.filter((a: any) => a.transferido).length || 0;
      const desistentes = (turma.alunos as any[])?.filter((a: any) => a.desistente).length || 0;
      const abandonos = total - (ativos + transferidos + desistentes);

      return { turma: (turma as any).nome, total, ativos, transferidos, desistentes, abandonos };
=======
      const total = turma.alunos?.length || 0;
      const ativos = turma.alunos?.filter((a: any) => a.ativo).length || 0;
      const inativos = total - ativos;

      return { turma: turma.nome, total, ativos, inativos };
>>>>>>> feature/prd003-secretary-class-view-refactor
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
