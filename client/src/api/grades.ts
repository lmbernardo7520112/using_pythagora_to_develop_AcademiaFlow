//client/src/api/grades.ts

import api from './api';
import { Student } from '@/types/academic';

// Tipagem de resposta vinda do backend
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
 * 🔹 Busca notas de todos os alunos de uma turma e disciplina
 * Endpoint: GET /api/notas/:turmaId/:disciplinaId
 */
export const getGradeData = async (turmaId: string, disciplinaId: string) => {
  try {
    const response = await api.get(`/api/notas/${turmaId}/${disciplinaId}`);
    return response.data as GradeInfo[];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

/**
 * 🔹 Atualiza a nota de um único aluno
 * Estratégia: chamamos o mesmo endpoint /api/notas/salvar com apenas 1 update
 * Endpoint: POST /api/notas/salvar
 * Body: { turmaId, disciplinaId, updates: [{ alunoId, avaliacaoType, nota }] }
 */
export const updateStudentGrade = async (
  turmaId: string,
  disciplinaId: string,
  studentId: string,
  field: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final',
  value: number | null
) => {
  try {
    const response = await api.post(`/api/notas/salvar`, {
      turmaId,
      disciplinaId,
      updates: [{ alunoId: studentId, avaliacaoType: field, nota: value }],
    });
    return response.data as { message: string };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

/**
 * 🔹 Salva em lote as notas de todos os alunos de uma turma/disciplina
 * Endpoint: POST /api/notas/salvar
 * Body: { turmaId, disciplinaId, updates: [...] }
 */
export const saveAllGrades = async (
  turmaId: string,
  disciplinaId: string,
  students: Student[]
) => {
  try {
    // Transforma o array de students no formato de updates esperado
    const updates = students.flatMap((student) => {
      const updatesForStudent: {
        alunoId: string;
        avaliacaoType: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final';
        nota: number | null;
      }[] = [];

      if (student.bim1 !== undefined) {
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: 'avaliacao1',
          nota: student.bim1 ?? null,
        });
      }
      if (student.bim2 !== undefined) {
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: 'avaliacao2',
          nota: student.bim2 ?? null,
        });
      }
      if (student.bim3 !== undefined) {
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: 'avaliacao3',
          nota: student.bim3 ?? null,
        });
      }
      if (student.bim4 !== undefined) {
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: 'final',
          nota: student.bim4 ?? null,
        });
      }

      return updatesForStudent;
    });

    const response = await api.post(`/api/notas/salvar`, {
      turmaId,
      disciplinaId,
      updates,
    });

    return response.data as { message: string };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};
