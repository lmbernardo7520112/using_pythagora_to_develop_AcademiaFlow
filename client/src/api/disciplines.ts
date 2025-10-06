// client/src/api/disciplines.ts

// client/src/api/disciplines.ts

import api from './api';
import { DisciplineClass } from '@/types/academic';

/**
 * 🔹 Busca todas as turmas/disciplina atribuídas ao professor logado
 * Endpoint: GET /api/professor/disciplinas
 */
export const getProfessorDisciplines = async (): Promise<{ disciplineClasses: DisciplineClass[] }> => {
  try {
    // ✅ Corrigido: rota conforme backend real
    const response = await api.get('/api/professor/disciplinas');

    // Validação defensiva da resposta
    if (!response?.data || !Array.isArray(response.data.disciplineClasses)) {
      console.error('⚠️ Resposta inesperada da API:', response.data);
      throw new Error('Formato inesperado de resposta ao buscar disciplinas do professor.');
    }

    return response.data as { disciplineClasses: DisciplineClass[] };
  } catch (error: any) {
    // ✅ Logging aprimorado para facilitar diagnóstico no console do browser
    console.error('❌ Erro ao buscar disciplinas do professor:', error);

    // Garante uma mensagem legível mesmo sem response.data
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Erro desconhecido ao buscar disciplinas.';

    throw new Error(message);
  }
};
