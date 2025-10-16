//client/src/api/grades.ts

// client/src/api/grades.ts

import api from "./api";
import {
  FrontendStudent,
  BackendGradeInfo,
  GradeUpdatePayload,
} from "@/types/academic";

/**
 * GET /api/notas/:turmaId/:disciplinaId
 */
export const getGradeData = async (
  turmaId: string,
  disciplinaId: string
): Promise<BackendGradeInfo[]> => {
  try {
    if (!turmaId || !disciplinaId)
      throw new Error("Missing turmaId or disciplinaId");

    const response = await api.get(`/notas/${turmaId}/${disciplinaId}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching grade data:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

/**
 * POST /api/notas/salvar — update unitário
 */
export const updateStudentGrade = async (
  turmaId: string,
  disciplinaId: string,
  studentId: string,
  field: "avaliacao1" | "avaliacao2" | "avaliacao3" | "final" | "pf",
  value: number | null
): Promise<{ message: string }> => {
  try {
    if (!turmaId || !disciplinaId || !studentId)
      throw new Error("Missing required parameters");

    const updates: GradeUpdatePayload[] = [
      { alunoId: studentId, avaliacaoType: field, nota: value },
    ];

    const response = await api.post(`/notas/salvar`, {
      turmaId,
      disciplinaId,
      updates,
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error updating student grade:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

/**
 * POST /api/notas/salvar — save em lote
 */
export const saveAllGrades = async (
  turmaId: string,
  disciplinaId: string,
  students: FrontendStudent[]
): Promise<{ message: string }> => {
  try {
    if (!Array.isArray(students))
      throw new Error("Invalid students array for grade saving");

    const updates: GradeUpdatePayload[] = students.flatMap((student) => {
      const updatesForStudent: GradeUpdatePayload[] = [];

      if (student.bim1 !== undefined)
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: "avaliacao1",
          nota: student.bim1 ?? null,
        });

      if (student.bim2 !== undefined)
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: "avaliacao2",
          nota: student.bim2 ?? null,
        });

      if (student.bim3 !== undefined)
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: "avaliacao3",
          nota: student.bim3 ?? null,
        });

      // bim4 → final
      if (student.bim4 !== undefined)
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: "final",
          nota: student.bim4 ?? null,
        });

      if (student.pf !== undefined)
        updatesForStudent.push({
          alunoId: student._id,
          avaliacaoType: "pf",
          nota: student.pf ?? null,
        });

      return updatesForStudent;
    });

    const response = await api.post(`/notas/salvar`, {
      turmaId,
      disciplinaId,
      updates,
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error saving all grades:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};
