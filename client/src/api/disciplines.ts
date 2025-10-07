// client/src/api/disciplines.ts

import api from './api';
import { ProfessorDisciplineWithTurmas } from '@/types/academic'; // ✅ Importar o tipo correto

// Definir a interface para o retorno da API de disciplinas do professor
// Isso depende de como o seu backend está retornando os dados
interface GetProfessorDisciplinesResponse {
  success: boolean;
  data: ProfessorDisciplineWithTurmas[]; // ✅ Alinhado com o que o frontend espera
}

/**
 * 🔹 Busca todas as disciplinas e suas turmas atribuídas ao professor logado.
 * Endpoint: GET /api/professor/disciplinas
 */
export const getProfessorDisciplines = async (): Promise<GetProfessorDisciplinesResponse> => {
  try {
    const response = await api.get('/professor/disciplinas');
    // ✅ CORREÇÃO: Assegurar que o retorno da API é do tipo GetProfessorDisciplinesResponse
    return response.data; // Assumindo que Axios retorna { data: seu_payload_do_backend }
  } catch (error: any) {
    console.error('Error fetching professor disciplines:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};