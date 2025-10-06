// server/services/gradeService.ts


import mongoose, { Types } from 'mongoose';
import { INota, Nota } from '../models/Nota';
import { IAluno, Aluno } from '../models/Aluno';
import { ITurma, Turma } from '../models/Turma';
import { IDisciplina, Disciplina } from '../models/Disciplina';

interface GradeUpdate {
  alunoId: string;
  avaliacaoType: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final';
  nota: number | null;
}

interface GradeInfo {
  _id: string;
  nome: string;
  matricula: string;
  notas: {
    avaliacao1?: number | null;
    avaliacao2?: number | null;
    avaliacao3?: number | null;
    final?: number | null;
  };
  media: number | null;
  situacao: 'Aprovado' | 'Reprovado' | 'Recuperação' | 'Pendente' | null;
}

/**
 * 🔹 Recupera as notas de todos os alunos de uma turma e disciplina
 */
export const getGradesByTurmaAndDisciplina = async (
  turmaId: string,
  disciplinaId: string
): Promise<GradeInfo[]> => {
  try {
    // Busca todas as notas correspondentes
    const notas = await Nota.find({ turma: turmaId, disciplina: disciplinaId })
      .populate('aluno') // agora populando conforme o schema Nota
      .lean()
      .exec();

    // Busca os alunos vinculados à turma
    const alunosDaTurma = await Aluno.find({ turma: turmaId }).lean();

    const gradesMap = new Map<string, GradeInfo>();

    for (const aluno of alunosDaTurma) {
      const notaExistente = notas.find((n) => {
        // `n.aluno` é o campo populado
        const alunoPopulado = n.alunoId as unknown as IAluno | null;

        if (!alunoPopulado || !alunoPopulado._id) return false;

        return alunoPopulado._id.toString() === aluno._id.toString();
      });

      gradesMap.set(aluno._id.toString(), {
        _id: aluno._id.toString(),
        nome: aluno.nome,
        matricula: aluno.matricula,
        notas: {
          avaliacao1: notaExistente?.notas?.avaliacao1 ?? null,
          avaliacao2: notaExistente?.notas?.avaliacao2 ?? null,
          avaliacao3: notaExistente?.notas?.avaliacao3 ?? null,
          final: notaExistente?.notas?.final ?? null,
        },
        media: notaExistente?.media ?? null,
        situacao: notaExistente?.situacao ?? null,
      });
    }

    return Array.from(gradesMap.values());
  } catch (error) {
    console.error('❌ Error fetching grades:', error);
    throw new Error('Could not retrieve grades.');
  }
};

/**
 * 🔹 Salva ou atualiza notas de uma turma/disciplina em transação atômica
 */
export const saveGrades = async (
  turmaId: string,
  disciplinaId: string,
  updates: GradeUpdate[],
  updatedBy: string
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const update of updates) {
      const { alunoId, avaliacaoType, nota } = update;

      const updateField = `notas.${avaliacaoType}`;

      if (nota === null) {
        await Nota.findOneAndUpdate(
          { aluno: alunoId, turma: turmaId, disciplina: disciplinaId },
          {
            $unset: { [updateField]: '' },
            updatedBy,
            atualizadoEm: new Date(),
          },
          { session }
        );
      } else {
        await Nota.findOneAndUpdate(
          { aluno: alunoId, turma: turmaId, disciplina: disciplinaId },
          {
            $set: { [updateField]: nota },
            updatedBy,
            atualizadoEm: new Date(),
          },
          { upsert: true, new: true, session }
        );
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Error saving grades in transaction:', error);
    throw new Error('Could not save grades due to a transaction error.');
  } finally {
    session.endSession();
  }
};
