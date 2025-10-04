import api from './api';
import { DisciplineClass } from '@/types/academic';

// Description: Get all discipline-class combinations for the logged-in professor
// Endpoint: GET /api/disciplines/professor
// Request: {}
// Response: { disciplineClasses: Array<DisciplineClass> }
export const getProfessorDisciplines = async () => {
  // Mocking the response
  return new Promise<{ disciplineClasses: DisciplineClass[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        disciplineClasses: [
          {
            _id: '1',
            disciplineName: 'Matemática',
            disciplineCode: 'MAT101',
            className: 'Turma 9º A',
            academicYear: '2024',
            teacherId: 'teacher1',
            teacherName: 'Prof. João Silva',
          },
          {
            _id: '2',
            disciplineName: 'Física',
            disciplineCode: 'FIS201',
            className: 'Turma 9º A',
            academicYear: '2024',
            teacherId: 'teacher1',
            teacherName: 'Prof. João Silva',
          },
          {
            _id: '3',
            disciplineName: 'Matemática',
            disciplineCode: 'MAT101',
            className: 'Turma 9º B',
            academicYear: '2024',
            teacherId: 'teacher1',
            teacherName: 'Prof. João Silva',
          },
          {
            _id: '4',
            disciplineName: 'Química',
            disciplineCode: 'QUI301',
            className: 'Turma 8º A',
            academicYear: '2024',
            teacherId: 'teacher1',
            teacherName: 'Prof. João Silva',
          },
        ],
      });
    }, 800);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/disciplines/professor');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};