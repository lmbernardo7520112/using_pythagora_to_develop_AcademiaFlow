// server/services/secretariaService.ts

import mongoose from "mongoose";
import Turma from "../models/Turma.js";
import Aluno from "../models/Aluno.js";
import Disciplina from "../models/Disciplina.js";
import { getGradesByTurmaAndDisciplina } from "./gradeService.js";

/**
 * 🔄 Normaliza status do aluno garantindo exclusividade entre:
 * Ativo, Transferido e Abandono (Evadido).
 */
function normalizeAlunoStatus(
  current: any,
  patch: Partial<{ ativo: boolean; transferido: boolean; abandono: boolean }>
) {
  const out = {
    ativo: current?.ativo ?? true,
    transferido: current?.transferido ?? false,
    abandono: current?.abandono ?? false,
  };

  if (typeof patch.ativo === "boolean") out.ativo = patch.ativo;
  if (typeof patch.transferido === "boolean") out.transferido = patch.transferido;
  if (typeof patch.abandono === "boolean") out.abandono = patch.abandono;

  // Exclusividade entre estados
  if (out.transferido) {
    out.abandono = false;
    out.ativo = false;
  } else if (out.abandono) {
    out.transferido = false;
    out.ativo = false;
  } else if (out.ativo) {
    out.transferido = false;
    out.abandono = false;
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

      return turmas.map((t: any) => ({
        _id: t._id.toString(),
        nome: t.nome ?? "(Sem nome)",
        ano: t.ano ?? new Date().getFullYear(),
        professor: t.professor ?? null,
        disciplinas: t.disciplinas ?? [],
        alunos: t.alunos ?? [],
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
        .populate("alunos", "nome matricula email ativo transferido abandono status")
        .lean();
      return turma ?? null;
    } catch (error) {
      console.error("❌ secretariaService.getTurmaById:", error);
      throw new Error("Erro ao obter turma");
    }
  },

  async updateAlunosInTurma(turmaId: string, alunosIds: string[]) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId))
        throw new Error("ID de turma inválido");

      const turma = await Turma.findById(turmaId);
      if (!turma) throw new Error("Turma não encontrada");

      turma.alunos = alunosIds.map((id) => new mongoose.Types.ObjectId(id));
      await turma.save();

      await Aluno.updateMany(
        { _id: { $in: alunosIds } },
        { $set: { turma: turma._id } }
      );

      const turmaAtualizada = await Turma.findById(turmaId)
        .populate("professor", "nome email")
        .populate("disciplinas", "nome codigo")
        .populate("alunos", "nome matricula email ativo transferido abandono status")
        .lean();

      return turmaAtualizada;
    } catch (error) {
      console.error("❌ secretariaService.updateAlunosInTurma:", error);
      throw new Error("Erro ao atualizar alunos na turma");
    }
  },

  // ==========================================================
  // 👩‍🎓 ALUNOS
  // ==========================================================
  async listAlunosByTurma(turmaId: string) {
    if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");
    return await Aluno.find({ turma: turmaId })
      .select("nome matricula email ativo transferido abandono turma status")
      .sort({ nome: 1 })
      .lean();
  },

  async updateAluno(id: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");

    const current = await Aluno.findById(id).lean();
    if (!current) throw new Error("Aluno não encontrado");

    const normalized = normalizeAlunoStatus(current, {
      ativo: data.ativo,
      transferido: data.transferido,
      abandono: data.abandono,
    });

    await Aluno.updateOne(
      { _id: id },
      {
        $set: {
          nome: data.nome ?? current.nome,
          email: data.email ?? current.email,
          ativo: normalized.ativo,
          transferido: normalized.transferido,
          abandono: normalized.abandono,
          status: data.status ?? current.status,
        },
      }
    );

    return await Aluno.findById(id)
      .select("nome matricula email ativo transferido abandono turma status")
      .lean();
  },

  // ==========================================================
  // 📊 DASHBOARD
  // ==========================================================
  async getDashboardGeral() {
    try {
      const totalTurmas = await Turma.countDocuments({ ativo: true });
      const totalAlunos = await Aluno.countDocuments();
      const ativos = await Aluno.countDocuments({ ativo: true });
      const transferidos = await Aluno.countDocuments({ transferido: true });
      const abandonos = await Aluno.countDocuments({ abandono: true });

      return {
        totalTurmas,
        totalAlunos,
        ativos,
        transferidos,
        desistentes: abandonos,
        abandonos,
      };
    } catch (error) {
      console.error("❌ secretariaService.getDashboardGeral:", error);
      throw new Error("Erro ao gerar dashboard geral");
    }
  },

  async getDashboardTurma(turmaId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(turmaId)) throw new Error("ID inválido");

      const turma = await Turma.findById(turmaId)
        .populate("alunos", "ativo transferido abandono status")
        .lean();

      if (!turma) throw new Error("Turma não encontrada");

      const alunos = (turma.alunos as any[]) ?? [];
      const total = alunos.length;
      const ativos = alunos.filter((a) => a.ativo).length;
      const transferidos = alunos.filter((a) => a.transferido).length;
      const abandonos = alunos.filter((a) => a.abandono).length;

      return { turma: turma.nome, total, ativos, transferidos, abandonos };
    } catch (error) {
      console.error("❌ secretariaService.getDashboardTurma:", error);
      throw new Error("Erro ao gerar dashboard da turma");
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
        _id: d._id.toString(),
        nome: d.nome ?? "(Sem nome)",
        codigo: d.codigo ?? "(Sem código)",
        cargaHoraria: d.cargaHoraria ?? 0,
        ativo: d.ativo !== false,
        professor: d.professor
          ? {
              _id: d.professor._id?.toString?.(),
              nome: d.professor.nome,
              email: d.professor.email,
            }
          : null,
        turma: d.turma
          ? {
              _id: d.turma._id?.toString?.(),
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

  async assignProfessorToDisciplina(disciplinaId: string, professorId: string | null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(disciplinaId))
        throw new Error("ID de disciplina inválido");

      const disciplina = await Disciplina.findById(disciplinaId);
      if (!disciplina) throw new Error("Disciplina não encontrada");

      disciplina.professor = professorId ? new mongoose.Types.ObjectId(professorId) : null;
      await disciplina.save();

      return await Disciplina.findById(disciplinaId)
        .populate("professor", "nome email")
        .populate("turma", "nome ano")
        .lean();
    } catch (error) {
      console.error("❌ secretariaService.assignProfessorToDisciplina:", error);
      throw new Error("Erro ao atribuir professor à disciplina");
    }
  },

  async assignTurmaToDisciplina(disciplinaId: string, turmaId: string | null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(disciplinaId))
        throw new Error("ID de disciplina inválido");

      const disciplina = await Disciplina.findById(disciplinaId);
      if (!disciplina) throw new Error("Disciplina não encontrada");

      disciplina.turma = turmaId ? new mongoose.Types.ObjectId(turmaId) : null;
      await disciplina.save();

      return await Disciplina.findById(disciplinaId)
        .populate("professor", "nome email")
        .populate("turma", "nome ano")
        .lean();
    } catch (error) {
      console.error("❌ secretariaService.assignTurmaToDisciplina:", error);
      throw new Error("Erro ao vincular turma à disciplina");
    }
  },

  // ==========================================================
  // 📊 RELATÓRIOS: TAXAS DE APROVAÇÃO
  // ==========================================================
  async getTaxasAprovacao() {
    try {
      const turmas = await Turma.find()
        .populate({
          path: "alunos",
          select: "status nome ativo transferido abandono",
        })
        .lean();

      const resultado: Record<string, any> = {};

      for (const turma of turmas) {
        // ✅ Cast explícito para eliminar erro de tipagem
        const alunos = (turma.alunos as any[]) ?? [];
        const total = alunos.length || 1;

        const aprovados = alunos.filter((a: any) => a.status === "aprovado").length;
        const reprovados = alunos.filter((a: any) => a.status === "reprovado").length;
        const evadidos = alunos.filter((a: any) => a.status === "evadido" || a.abandono).length;

        resultado[turma.nome ?? "Sem nome"] = {
          aprovacao: ((aprovados / total) * 100).toFixed(1),
          reprovacao: ((reprovados / total) * 100).toFixed(1),
          evasao: ((evadidos / total) * 100).toFixed(1),
        };
      }

      return { turmas: resultado };
    } catch (error) {
      console.error("❌ secretariaService.getTaxasAprovacao:", error);
      throw new Error("Erro ao calcular taxas de aprovação.");
    }
  },
};

export default secretariaService;
