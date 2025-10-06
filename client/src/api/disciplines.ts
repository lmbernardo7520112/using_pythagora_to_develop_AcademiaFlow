// client/src/api/disciplines.ts


import api from './api';
import { DisciplineClass } from '@/types/academic';

/**
 * 🔹 Busca todas as turmas/disciplina atribuídas ao professor logado
 * Endpoint: GET /api/professor/disciplinas
 */
export const getProfessorDisciplines = async (): Promise<{ disciplineClasses: DisciplineClass[] }> => {
  try {
    const response = await api.get('/professor/disciplinas');

    // Assumimos que a resposta do backend é sempre { success: boolean, data: DisciplineClass[] }
    // Ajuste na validação e no acesso aos dados
    if (!response?.data || !Array.isArray(response.data.data)) { // <--- MUDANÇA AQUI: response.data.data
      console.error('⚠️ Resposta inesperada da API:', response.data);
      throw new Error('Formato inesperado de resposta ao buscar disciplinas do professor.');
    }

    // Retorna no formato esperado pelo ProfessorDashboard
    return { disciplineClasses: response.data.data as DisciplineClass[] }; // <--- MUDANÇA AQUI: response.data.data
  } catch (error: any) {
    console.error('❌ Erro ao buscar disciplinas do professor:', error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Erro desconhecido ao buscar disciplinas.';
    throw new Error(message);
  }
};