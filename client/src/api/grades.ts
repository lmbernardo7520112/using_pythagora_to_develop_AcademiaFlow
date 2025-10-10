//client/src/api/grades.ts


import api from './api';
import { FrontendStudent, BackendGradeInfo, GradeUpdatePayload } from '@/types/academic'; // ✅ CORREÇÃO: Importar tipos ajustados

/**
 * 🔹 Busca notas de todos os alunos de uma turma e disciplina
 * Endpoint: GET /api/notas/:turmaId/:disciplinaId
 */
export const getGradeData = async (turmaId: string, disciplinaId: string): Promise<BackendGradeInfo[]> => {
  try {
    // ✅ CORRIGIDO: Removido '/api' redundante (baseURL já tem '/api')
    const response = await api.get(`/notas/${turmaId}/${disciplinaId}`);
    return response.data; // O retorno já deve ser um array de BackendGradeInfo
  } catch (error: any) {
    console.error('Error fetching grade data:', error);
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
  // ✅ CORREÇÃO: Usar os tipos de avaliação do backend
  field: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final' | 'pf', 
  value: number | null
): Promise<{ message: string }> => {
  try {
    const updates: GradeUpdatePayload[] = [{ alunoId: studentId, avaliacaoType: field, nota: value }];

    // ✅ CORRIGIDO: Removido '/api' redundante
    const response = await api.post(`/notas/salvar`, {
      turmaId,
      disciplinaId,
      updates,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating student grade:', error);
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
  students: FrontendStudent[] // ✅ CORREÇÃO: Receber FrontendStudent
): Promise<{ message: string }> => {
  try {
    // Transforma o array de students no formato de updates esperado
    const updates: GradeUpdatePayload[] = students.flatMap((student) => {
      const updatesForStudent: GradeUpdatePayload[] = [];

      // ✅ CORREÇÃO: Mapear 'bim' do frontend para 'avaliacao'/'final' do backend
      if (student.bim1 !== undefined) {
        updatesForStudent.push({ alunoId: student._id, avaliacaoType: 'avaliacao1', nota: student.bim1 ?? null });
      }
      if (student.bim2 !== undefined) {
        updatesForStudent.push({ alunoId: student._id, avaliacaoType: 'avaliacao2', nota: student.bim2 ?? null });
      }
      if (student.bim3 !== undefined) {
        updatesForStudent.push({ alunoId: student._id, avaliacaoType: 'avaliacao3', nota: student.bim3 ?? null });
      }
      // O 'bim4' do frontend é 'final' no backend
      if (student.bim4 !== undefined) {
        updatesForStudent.push({ alunoId: student._id, avaliacaoType: 'final', nota: student.bim4 ?? null });
      }
      // Adicione 'pf' se estiver sendo usado no frontend
      if (student.pf !== undefined) {
        updatesForStudent.push({ alunoId: student._id, avaliacaoType: 'pf', nota: student.pf ?? null });
      }

      return updatesForStudent;
    });

    // ✅ CORRIGIDO: Removido '/api' redundante
    const response = await api.post(`/notas/salvar`, {
      turmaId,
      disciplinaId,
      updates,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error saving all grades:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};