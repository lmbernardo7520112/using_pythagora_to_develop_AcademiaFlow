// server/services/professorService.ts



import { HydratedDocument } from 'mongoose';
import { IDisciplina, Disciplina } from '../models/Disciplina';
import { ITurma } from '../models/Turma';
import Turma from '../models/Turma'; 
import { IUser } from '../models/User';
import User from '../models/User'

interface ProfessorDiscipline {
  _id: string;
  nome: string;
  codigo: string;
  turmas: {
    _id: string;
    nome: string;
  }[];
}

export const getDisciplinasByProfessor = async (professorId: string): Promise<ProfessorDiscipline[]> => {
  try {
    const turmasDoProfessor = await Turma.find({ professor: professorId })
      .populate('disciplina')
      .lean();

    const disciplinasMap = new Map<string, ProfessorDiscipline>();

    for (const turma of turmasDoProfessor as any[]) { // Cast to any[] to avoid type errors with lean()
      if (turma.disciplina) {
        const disciplinaId = (turma.disciplina as any)._id.toString();
        if (!disciplinasMap.has(disciplinaId)) {
          disciplinasMap.set(disciplinaId, {
            _id: disciplinaId,
            nome: (turma.disciplina as any).nome,
            codigo: (turma.disciplina as any).codigo,
            turmas: [],
          });
        }
        disciplinasMap.get(disciplinaId)?.turmas.push({
          _id: (turma._id as any).toString(),
          nome: turma.nome,
        });
      }
    }

    return Array.from(disciplinasMap.values());
  } catch (error) {
    console.error('Error fetching disciplines by professor:', error);
    throw new Error('Could not retrieve disciplines for the professor.');
  }
};