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
    const response = await api.get('/professor/disciplinas');

    if (!response?.data || !Array.isArray(response.data.data)) {
      console.error('⚠️ Resposta inesperada da API:', response.data);
      throw new Error('Formato inesperado de resposta ao buscar disciplinas do professor.');
    }

    const rawDisciplines = response.data.data as any[]; // Usar 'any[]' aqui é ok, pois estamos mapeando explicitamente

    const mappedDisciplineClasses: DisciplineClass[] = rawDisciplines.map(rawDisc => {
      const firstTurma = rawDisc.turmas && rawDisc.turmas.length > 0 ? rawDisc.turmas[0] : null;

      // Certifique-se de que rawDisc.professorId e rawDisc.professorName existem no backend
      // Se eles não existirem, o TypeScript ainda reclamará.
      return {
        _id: rawDisc._id,
        disciplineName: rawDisc.nome,
        disciplineCode: rawDisc.codigo,
        className: firstTurma ? firstTurma.nome : 'N/A',
        academicYear: firstTurma ? firstTurma.ano : 0,
        teacherId: rawDisc.professorId,   // ✅ ADICIONADO AQUI
        teacherName: rawDisc.professorName, // ✅ ADICIONADO AQUI
      };
    });

    console.log('✅ Disciplinas mapeadas:', mappedDisciplineClasses);

    return { disciplineClasses: mappedDisciplineClasses };
  } catch (error: any) {
    console.error('❌ Erro ao buscar disciplinas do professor:', error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Erro desconhecido ao buscar disciplinas.';
    throw new Error(message);
  }
};