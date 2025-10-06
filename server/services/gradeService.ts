// server/services/gradeService.ts

import mongoose from 'mongoose';
import { Nota } from '../models/Nota';
import { Aluno } from '../models/Aluno';
import { calculateGrade } from '../lib/gradeCalculations';

interface GradeUpdate {
  alunoId: string;
  avaliacaoType:
    | 'avaliacao1'
    | 'avaliacao2'
    | 'avaliacao3'
    | 'avaliacao4'
    | 'pf'
    | 'final';
  nota: number | null;
}

interface GradeInfo {
  _id: string;
  nome: string;
  matricula: string;
  notas: Record<
    'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'avaliacao4' | 'pf' | 'final',
    number | null | undefined
  >;
  media: number | null;
  situacao: 'Aprovado' | 'Reprovado' | 'Recuperação' | 'Pendente' | null;
}

/**
 * 🔹 Recupera todas as notas de uma turma e disciplina, populando alunos
 */
export const getGradesByTurmaAndDisciplina = async (
  turmaId: string,
  disciplinaId: string
): Promise<GradeInfo[]> => {
  try {
    const notas = await Nota.find({ turmaId, disciplinaId })
      .populate('alunoId')
      .lean()
      .exec();

    const alunos = await Aluno.find({ turmaId }).lean();

    const results: GradeInfo[] = alunos.map((aluno) => {
      const notaDoc = notas.find(
        (n) =>
          String(
            (n.alunoId as any)?._id ?? n.alunoId
          ) === String(aluno._id)
      );

      return {
        _id: aluno._id.toString(),
        nome: aluno.nome,
        matricula: aluno.matricula,
        notas: {
          avaliacao1: notaDoc?.notas?.avaliacao1 ?? null,
          avaliacao2: notaDoc?.notas?.avaliacao2 ?? null,
          avaliacao3: notaDoc?.notas?.avaliacao3 ?? null,
          avaliacao4: notaDoc?.notas?.avaliacao4 ?? null,
          pf: notaDoc?.notas?.pf ?? null,
          final: notaDoc?.notas?.final ?? null,
        },
        media: notaDoc?.media ?? null,
        situacao: notaDoc?.situacao ?? null,
      };
    });

    return results;
  } catch (error) {
    console.error('❌ Error fetching grades:', error);
    throw new Error('Could not retrieve grades.');
  }
};

/**
 * 🔹 Salva notas de forma transacional e consistente
 * - Evita uso de `$set` com `undefined`
 * - Calcula `media` e `situacao` antes do update
 * - Usa `withTransaction` para garantir atomicidade
 */
export const saveGrades = async (
  turmaId: string,
  disciplinaId: string,
  updates: GradeUpdate[],
  updatedBy: string
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const update of updates) {
        const { alunoId, avaliacaoType, nota } = update;

        // Obtém documento atual (pode não existir ainda)
        const existing = await Nota.findOne({
          alunoId,
          turmaId,
          disciplinaId,
        }).session(session);

        // Reconstrói notas atualizadas sem campos undefined
        const notasAtuais = existing?.notas ? { ...existing.notas } : {};
        if (nota === null) {
          delete notasAtuais[avaliacaoType];
        } else {
          notasAtuais[avaliacaoType] = nota;
        }

        // Calcula média e situação antes de persistir
        const { media, situacao } = calculateGrade(notasAtuais);

        // Monta objeto de update sem `undefined`
        const updateObj: any = {
          notas: notasAtuais,
          media,
          situacao,
          updatedBy,
          updatedAt: new Date(),
        };

        await Nota.findOneAndUpdate(
          { alunoId, turmaId, disciplinaId },
          updateObj,
          { upsert: true, new: true, session }
        );
      }
    });

    console.log('✅ Grades saved successfully (transaction committed)');
  } catch (error) {
    console.error('❌ Transaction aborted:', error);
    throw new Error('Could not save grades (transaction failed).');
  } finally {
    await session.endSession();
  }
};
