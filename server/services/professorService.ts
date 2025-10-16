// server/services/professorService.ts

import { Types } from "mongoose";
import { IDisciplina } from "../models/Disciplina.js";
import { ITurma } from "../models/Turma.js";
import Turma from "../models/Turma.js";
import User from "../models/User.js";

interface ProfessorDiscipline {
  _id: string;
  nome: string;
  codigo: string;
  professorId: string;
  professorName: string;
  turmas: {
    _id: string;
    nome: string;
    ano: number;
  }[];
}

/**
 * 🔹 Busca disciplinas atribuídas ao professor autenticado,
 * garantindo que apenas aquelas com `professor: <professorId>` sejam incluídas.
 */
export const getDisciplinasByProfessor = async (
  professorId: string
): Promise<ProfessorDiscipline[]> => {
  try {
    if (!Types.ObjectId.isValid(professorId)) {
      throw new Error(`Invalid professorId: ${professorId}`);
    }

    // ✅ Busca o professor no banco (User)
    const professor = await User.findById(professorId).lean();
    if (!professor) {
      throw new Error("Professor not found.");
    }

    const professorName = professor.email;

    // ✅ Busca turmas vinculadas ao professor
    const turmasDoProfessor = await Turma.find({
      professor: new Types.ObjectId(professorId),
    })
      .populate({
        path: "disciplinas",
        select: "_id nome codigo professor",
        match: { professor: new Types.ObjectId(professorId) },
      })
      .select("_id nome ano disciplinas professor")
      .lean();

    const disciplinasMap = new Map<string, ProfessorDiscipline>();

    for (const turma of turmasDoProfessor) {
      // Aqui o TypeScript ainda entende como ObjectId[], então precisamos converter de forma segura
      const disciplinasPopuladas = (turma.disciplinas ?? []) as unknown as IDisciplina[];

      for (const d of disciplinasPopuladas) {
        if (!d || typeof d !== "object" || !d._id) continue;

        const disciplinaId =
          typeof d._id === "object"
            ? (d._id as Types.ObjectId).toString()
            : (d._id as string);

        const profId =
          typeof d.professor === "object"
            ? (d.professor as Types.ObjectId).toString()
            : (d.professor as string);

        if (profId !== professorId) continue;

        if (!disciplinasMap.has(disciplinaId)) {
          disciplinasMap.set(disciplinaId, {
            _id: disciplinaId,
            nome: d.nome,
            codigo: d.codigo,
            professorId,
            professorName,
            turmas: [],
          });
        }

        disciplinasMap.get(disciplinaId)?.turmas.push({
          _id:
            typeof turma._id === "object"
              ? (turma._id as Types.ObjectId).toString()
              : (turma._id as string),
          nome: turma.nome,
          ano: turma.ano,
        });
      }
    }

    return Array.from(disciplinasMap.values());
  } catch (error) {
    console.error("❌ Error fetching disciplines by professor:", error);
    throw new Error("Could not retrieve disciplines for the professor.");
  }
};
