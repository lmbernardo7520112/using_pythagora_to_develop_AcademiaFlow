// server/services/professorService.ts


import { HydratedDocument, Types } from 'mongoose';
import { IDisciplina } from '../models/Disciplina.js';
import { ITurma } from '../models/Turma.js'; // Importa ITurma
import Turma from '../models/Turma.js';
import { IUser } from '../models/User.js';
import User from '../models/User.js'

interface ProfessorDiscipline {
  _id: string;
  nome: string;
  codigo: string;
  professorId: string;
  professorName: string;
  turmas: {
    _id: string;
    nome: string;
    ano: number; // ✅ Certifique-se que esta interface está correta
  }[];
}

export const getDisciplinasByProfessor = async (professorId: string): Promise<ProfessorDiscipline[]> => {
  try {
    // Definimos uma interface auxiliar para o tipo do documento de Turma com disciplinas populadas
    // e o formato simplificado do .lean()
    interface TurmaWithPopulatedDisciplines extends Omit<ITurma, 'disciplinas'> {
      _id: Types.ObjectId;
      disciplinas: (IDisciplina & { _id: Types.ObjectId })[];
      // O campo 'ano' já está em ITurma e não foi omitido, então ele estará presente
      // no objeto 'turma' após o .lean().
    }

    // Busque o nome do professor uma única vez
    const professor = await User.findById(professorId).lean();
    if (!professor) {
      throw new Error('Professor not found.');
    }
    const professorName = professor.email; // Ou professor.name, dependendo do seu User model

    const turmasDoProfessor = await Turma.find({ professor: professorId })
      .populate('disciplinas')
      .lean<TurmaWithPopulatedDisciplines[]>(); // Garante que 'turma.ano' está disponível aqui

    const disciplinasMap = new Map<string, ProfessorDiscipline>();

    for (const turma of turmasDoProfessor) {
      for (const disciplina of turma.disciplinas) {
        const disciplinaId = disciplina._id.toString();

        if (!disciplinasMap.has(disciplinaId)) {
          disciplinasMap.set(disciplinaId, {
            _id: disciplinaId,
            nome: disciplina.nome,
            codigo: disciplina.codigo,
            professorId: professorId,
            professorName: professorName,
            turmas: [],
          });
        }
        // Adiciona a turma atual à lista de turmas da disciplina, INCLUINDO O ANO
        disciplinasMap.get(disciplinaId)?.turmas.push({
          _id: turma._id.toString(),
          nome: turma.nome,
          ano: turma.ano, // ✅ ADICIONADO AQUI: Pegue o 'ano' do objeto 'turma' (que vem do DB)
        });
      }
    }

    return Array.from(disciplinasMap.values());
  } catch (error) {
    console.error('Error fetching disciplines by professor:', error);
    throw new Error('Could not retrieve disciplines for the professor.');
  }
};