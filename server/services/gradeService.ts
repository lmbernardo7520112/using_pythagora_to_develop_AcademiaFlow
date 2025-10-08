// server/services/gradeService.ts

import mongoose from 'mongoose';
import { Nota, INotaLean } from '../models/Nota.js';
import { Aluno } from '../models/Aluno.js';

interface GradeUpdate {
  alunoId: string;
  avaliacaoType: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'avaliacao4' | 'pf' | 'final';
  nota: number | null;
}

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

    // ✅ Validação de IDs
    if (!mongoose.Types.ObjectId.isValid(turmaId)) {
      throw new Error(`Invalid turmaId: ${turmaId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(disciplinaId)) {
      throw new Error(`Invalid disciplinaId: ${disciplinaId}`);
    }

    // 1️⃣ Buscar todos os alunos da turma
    const alunos = await Aluno.find({ turmaId: new mongoose.Types.ObjectId(turmaId) })
      .select('_id nome matricula')
      .lean();

    console.log(`✅ Found ${alunos.length} students in turma ${turmaId}`);

    if (alunos.length === 0) {
      console.warn('⚠️ No students found for this turma');
      return [];
    }

    // 2️⃣ Buscar notas existentes para esses alunos nesta disciplina
    const alunoIds = alunos.map((a) => a._id);
    const notas = await Nota.find({
      alunoId: { $in: alunoIds },
      disciplinaId: new mongoose.Types.ObjectId(disciplinaId),
      turmaId: new mongoose.Types.ObjectId(turmaId),
    }).lean<INotaLean[]>();

    console.log(`✅ Found ${notas.length} grade records`);

    // 3️⃣ Mapear notas por alunoId para acesso rápido
    const notasMap = new Map<string, INotaLean>();
    notas.forEach((nota) => {
      const alunoIdStr = nota.alunoId.toString();
      notasMap.set(alunoIdStr, nota);
    });

    // 4️⃣ Montar resposta com todos os alunos (com ou sem notas)
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
              pf: notaRecord.notas.pf ?? null, // ✅ ADICIONADO: Prova Final (PF)
              final: notaRecord.notas.final ?? null,
            }
          : {
              avaliacao1: null,
              avaliacao2: null,
              avaliacao3: null,
              pf: null, // ✅ ADICIONADO: Prova Final (PF)
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
 * 🔹 Salva/atualiza notas em lote para uma turma + disciplina
 * Usa transação do MongoDB para garantir atomicidade
 */
export const saveGrades = async (
  turmaId: string,
  disciplinaId: string,
  updates: GradeUpdate[],
  updatedBy: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('💾 Saving grades:', {
      turmaId,
      disciplinaId,
      updatesCount: updates.length,
      updatedBy,
    });

    // ✅ Validação de IDs
    if (!mongoose.Types.ObjectId.isValid(turmaId)) {
      throw new Error(`Invalid turmaId: ${turmaId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(disciplinaId)) {
      throw new Error(`Invalid disciplinaId: ${disciplinaId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(updatedBy)) {
      throw new Error(`Invalid updatedBy: ${updatedBy}`);
    }

    for (const update of updates) {
      const { alunoId, avaliacaoType, nota } = update;

      if (!mongoose.Types.ObjectId.isValid(alunoId)) {
        console.error(`❌ Invalid alunoId: ${alunoId}`);
        continue; // Pula este update
      }

      // 🔹 Usar findOneAndUpdate com upsert para criar ou atualizar
      await Nota.findOneAndUpdate(
        {
          alunoId: new mongoose.Types.ObjectId(alunoId),
          disciplinaId: new mongoose.Types.ObjectId(disciplinaId),
          turmaId: new mongoose.Types.ObjectId(turmaId),
        },
        {
          $set: {
            [`notas.${avaliacaoType}`]: nota,
            updatedBy: new mongoose.Types.ObjectId(updatedBy),
          },
        },
        {
          upsert: true, // ✅ Cria se não existir
          new: true,
          session,
        }
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