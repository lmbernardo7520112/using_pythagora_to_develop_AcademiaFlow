// server/services/gradeService.ts

import mongoose from 'mongoose';
import { Nota, INotaLean } from '../models/Nota.js';
import { Aluno } from '../models/Aluno.js';

/**
 * 🔹 Busca todas as notas de uma turma + disciplina
 * Retorna array com informações dos alunos e suas respectivas notas
 */
export const getGradesByTurmaAndDisciplina = async (
  turmaId: string,
  disciplinaId: string
) => {
  try {
    console.log('📚 Fetching grades for:', { turmaId, disciplinaId });

    // ✅ 1️⃣ Conversão explícita para ObjectId — ESSENCIAL
    const turmaObjId = new mongoose.Types.ObjectId(turmaId);
    const disciplinaObjId = new mongoose.Types.ObjectId(disciplinaId);

    // ✅ 2️⃣ Buscar todos os alunos da turma
    // Atenção: o campo correto no modelo Aluno é 'turma', não 'turmaId'
    const alunos = await Aluno.find({ turma: turmaObjId })
      .select('_id nome matricula')
      .lean();

    console.log(`✅ Found ${alunos.length} students in turma ${turmaId}`);

    if (alunos.length === 0) {
      console.warn('⚠️ No students found for this turma');
      return [];
    }

    // ✅ 3️⃣ Buscar notas existentes para esses alunos nesta disciplina
    const alunoIds = alunos.map((a) => a._id);

    const notas = await Nota.find({
      alunoId: { $in: alunoIds },
      disciplinaId: disciplinaObjId,
      turmaId: turmaObjId,
    }).lean<INotaLean[]>();

    console.log(`✅ Found ${notas.length} grade records`);

    // ✅ 4️⃣ Montar mapa de notas por aluno
    const notasMap = new Map<string, INotaLean>();
    notas.forEach((nota) => {
      const alunoIdStr = nota.alunoId.toString();
      notasMap.set(alunoIdStr, nota);
    });

    // ✅ 5️⃣ Montar resposta final
    const result = alunos.map((aluno) => {
      const alunoIdStr = aluno._id.toString();
      const notaRecord = notasMap.get(alunoIdStr);

      return {
        _id: alunoIdStr,
        nome: aluno.nome,
        matricula: aluno.matricula,
        notas: notaRecord
          ? {
              avaliacao1: notaRecord.notas.avaliacao1 ?? null,
              avaliacao2: notaRecord.notas.avaliacao2 ?? null,
              avaliacao3: notaRecord.notas.avaliacao3 ?? null,
              pf: notaRecord.notas.pf ?? null,
              final: notaRecord.notas.final ?? null,
            }
          : {
              avaliacao1: null,
              avaliacao2: null,
              avaliacao3: null,
              pf: null,
              final: null,
            },
        media: notaRecord?.media ?? null,
        situacao: notaRecord?.situacao ?? 'Pendente',
      };
    });

    console.log('✅ Grade data prepared:', result.length, 'records');
    return result;
  } catch (error) {
    console.error('❌ Error in getGradesByTurmaAndDisciplina:', error);
    throw error;
  }
};

/**
 * 🔹 Salva ou atualiza notas de uma turma + disciplina
 * Usando transação para garantir atomicidade
 */
export const saveGrades = async (
  turmaId: string,
  disciplinaId: string,
  updates: {
    alunoId: string;
    avaliacaoType: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'avaliacao4' | 'pf' | 'final';
    nota: number | null;
  }[],
  updatedBy: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('💾 Saving grades...', {
      turmaId,
      disciplinaId,
      updatesCount: updates.length,
      updatedBy,
    });

    // ✅ Validação de IDs
    if (!mongoose.Types.ObjectId.isValid(turmaId))
      throw new Error(`Invalid turmaId: ${turmaId}`);
    if (!mongoose.Types.ObjectId.isValid(disciplinaId))
      throw new Error(`Invalid disciplinaId: ${disciplinaId}`);
    if (!mongoose.Types.ObjectId.isValid(updatedBy))
      throw new Error(`Invalid updatedBy: ${updatedBy}`);

    const turmaObjId = new mongoose.Types.ObjectId(turmaId);
    const disciplinaObjId = new mongoose.Types.ObjectId(disciplinaId);
    const updatedByObjId = new mongoose.Types.ObjectId(updatedBy);

    // 🔁 Iterar sobre cada atualização
    for (const update of updates) {
      const { alunoId, avaliacaoType, nota } = update;

      if (!mongoose.Types.ObjectId.isValid(alunoId)) {
        console.warn(`⚠️ Skipping invalid alunoId: ${alunoId}`);
        continue;
      }

      const alunoObjId = new mongoose.Types.ObjectId(alunoId);

      // ✅ Atualiza ou cria nota (upsert)
      await Nota.findOneAndUpdate(
        { alunoId: alunoObjId, disciplinaId: disciplinaObjId, turmaId: turmaObjId },
        {
          $set: {
            [`notas.${avaliacaoType}`]: nota,
            updatedBy: updatedByObjId,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true, session }
      );
    }

    await session.commitTransaction();
    console.log('✅ Grades saved successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Error saving grades, transaction aborted:', error);
    throw error;
  } finally {
    session.endSession();
  }
};
