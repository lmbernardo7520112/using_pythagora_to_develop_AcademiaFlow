// server/services/secretariaService.ts


import mongoose from "mongoose";
import Turma from "../models/Turma.js";
import Aluno from "../models/Aluno.js";
import Disciplina from "../models/Disciplina.js";
import { getGradesByTurmaAndDisciplina } from "./gradeService.js";

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
      const turmas = await Turma.find()
        .populate("professor", "name email role")
        .populate("disciplinas", "nome codigo")
        .lean();

      if (!turmas || turmas.length === 0) return [];

      return turmas.map((t: any) => ({
        _id: t._id.toString(),
        nome: t.nome ?? "(Sem nome)",
        ano: t.ano ?? new Date().getFullYear(),
        professor: t.professor ?? null,
        disciplinas: Array.isArray(t.disciplinas) ? t.disciplinas : [],
        alunos: Array.isArray(t.alunos) ? t.alunos : [],
        ativo: t.ativo !== false,
      }));
    } catch (error) {
      console.error("❌ secretariaService.listTurmas:", error);
      return [];
    }
  },

  async getTurmaById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
      const turma = await Turma.findById(id)
        .populate("professor", "name email")
        .populate("disciplinas", "nome codigo")
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

      await Aluno.updateMany({ turma: id }, { $set: { ativo: false } }, { strict: false });
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
        .select("nome matricula email ativo transferido desistente turma")
        .sort({ nome: 1 })
        .lean();
    } catch (error) {
      console.error("❌ secretariaService.listAlunosByTurma:", error);
      throw new Error("Erro ao listar alunos");
    }
  },

  // ==========================================================
  // 📚 DISCIPLINAS (corrigido e tipado)
  // ==========================================================
  async listDisciplinas() {
    try {
      const disciplinas = await Disciplina.find()
        .populate("professor", "nome email role")
        .populate("turma", "nome ano")
        .sort({ nome: 1 })
        .lean();

      if (!disciplinas || disciplinas.length === 0) return [];

      return disciplinas.map((d: any) => ({
        _id: d._id.toString(),
        nome: d.nome ?? "(Sem nome)",
        codigo: d.codigo ?? "(Sem código)",
        cargaHoraria: d.cargaHoraria ?? 0,
        ativo: d.ativo !== false,
        professor: d.professor
          ? {
              _id: d.professor._id?.toString?.() ?? null,
              nome: d.professor.nome ?? "",
              email: d.professor.email ?? "",
              role: d.professor.role ?? "professor",
            }
          : null,
        turma: d.turma
          ? {
              _id: d.turma._id?.toString?.() ?? null,
              nome: d.turma.nome ?? "",
              ano: d.turma.ano ?? new Date().getFullYear(),
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
