//client/src/api/grades.ts
import api from './api';
import { GradeData, Student } from '@/types/academic';

// Description: Get grade data for a specific discipline-class combination
// Endpoint: GET /api/grades/:disciplineClassId
// Request: {}
// Response: { gradeData: GradeData }
export const getGradeData = async (disciplineClassId: string) => {
  // Mocking the response
  return new Promise<{ gradeData: GradeData }>((resolve) => {
    setTimeout(() => {
      const mockStudents: Student[] = Array.from({ length: 25 }, (_, i) => ({
        _id: `student-${i + 1}`,
        number: i + 1,
        name: `Aluno ${i + 1} da Silva`,
        bim1: Math.random() > 0.1 ? Number((Math.random() * 10).toFixed(1)) : undefined,
        bim2: Math.random() > 0.2 ? Number((Math.random() * 10).toFixed(1)) : undefined,
        bim3: Math.random() > 0.3 ? Number((Math.random() * 10).toFixed(1)) : undefined,
        bim4: Math.random() > 0.4 ? Number((Math.random() * 10).toFixed(1)) : undefined,
      }));

      resolve({
        gradeData: {
          disciplineClass: {
            _id: disciplineClassId,
            disciplineName: 'Matemática',
            disciplineCode: 'MAT101',
            className: 'Turma 9º A',
            academicYear: '2024',
            teacherId: 'teacher1',
            teacherName: 'Prof. João Silva',
          },
          students: mockStudents,
        },
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/grades/${disciplineClassId}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update a student's grade
// Endpoint: PUT /api/grades/:disciplineClassId/student/:studentId
// Request: { field: string, value: number }
// Response: { success: boolean, message: string }
export const updateStudentGrade = async (
  disciplineClassId: string,
  studentId: string,
  field: string,
  value: number
) => {
  // Mocking the response
  return new Promise<{ success: boolean; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Nota atualizada com sucesso' });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/grades/${disciplineClassId}/student/${studentId}`, {
  //     field,
  //     value,
  //   });
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Save all grades for a discipline-class
// Endpoint: POST /api/grades/:disciplineClassId/save-all
// Request: { students: Array<Student> }
// Response: { success: boolean, message: string }
export const saveAllGrades = async (disciplineClassId: string, students: Student[]) => {
  // Mocking the response
  return new Promise<{ success: boolean; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Todas as notas foram salvas com sucesso' });
    }, 800);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post(`/api/grades/${disciplineClassId}/save-all`, { students });
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};