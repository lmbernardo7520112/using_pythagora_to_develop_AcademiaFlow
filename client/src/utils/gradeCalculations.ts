//client/src/utils/gradeCalculations.ts
import { Student, ClassAnalytics } from '@/types/academic';

export const calculateNF = (bim1?: number, bim2?: number, bim3?: number, bim4?: number): number | undefined => {
  const grades = [bim1, bim2, bim3, bim4].filter((g) => g !== undefined) as number[];
  if (grades.length === 0) return undefined;
  return Number((grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2));
};

export const calculateMG = (nf?: number): number | undefined => {
  return nf;
};

export const calculateMF = (mg?: number, pf?: number): number | undefined => {
  if (mg === undefined) return undefined;
  if (mg >= 6.0) return mg;
  if (pf !== undefined) {
    return Number(((mg + pf) / 2).toFixed(2));
  }
  return mg;
};

export const calculateStatus = (mg?: number): 'Aprovado' | 'Recuperação' | 'Reprovado' | undefined => {
  if (mg === undefined) return undefined;
  if (mg >= 6.0) return 'Aprovado';
  if (mg >= 4.0) return 'Recuperação';
  return 'Reprovado';
};

export const calculateFinalStatus = (mf?: number, mg?: number): 'Aprovado' | 'Reprovado' | undefined => {
  if (mg === undefined) return undefined;
  if (mg >= 6.0) return 'Aprovado';
  if (mf === undefined) return undefined;
  return mf >= 5.0 ? 'Aprovado' : 'Reprovado';
};

export const needsRecoveryExam = (mg?: number): boolean => {
  if (mg === undefined) return false;
  return mg < 6.0 && mg >= 4.0;
};

export const recalculateStudent = (student: Student): Student => {
  const nf = calculateNF(student.bim1, student.bim2, student.bim3, student.bim4);
  const mg = calculateMG(nf);
  const status = calculateStatus(mg);
  const mf = calculateMF(mg, student.pf);
  const finalStatus = calculateFinalStatus(mf, mg);

  return {
    ...student,
    nf,
    mg,
    mf,
    status,
    finalStatus,
  };
};

export const calculateClassAnalytics = (students: Student[]): ClassAnalytics => {
  const validStudents = students.filter((s) => s.mg !== undefined);
  
  const classAverage = validStudents.length > 0
    ? Number((validStudents.reduce((sum, s) => sum + (s.mg || 0), 0) / validStudents.length).toFixed(2))
    : 0;

  const quarterAverages = {
    bim1: calculateQuarterAverage(students, 'bim1'),
    bim2: calculateQuarterAverage(students, 'bim2'),
    bim3: calculateQuarterAverage(students, 'bim3'),
    bim4: calculateQuarterAverage(students, 'bim4'),
  };

  const sortedGrades = validStudents.map((s) => s.mg || 0).sort((a, b) => a - b);
  const median = sortedGrades.length > 0
    ? sortedGrades.length % 2 === 0
      ? Number(((sortedGrades[sortedGrades.length / 2 - 1] + sortedGrades[sortedGrades.length / 2]) / 2).toFixed(2))
      : sortedGrades[Math.floor(sortedGrades.length / 2)]
    : 0;

  const approved = validStudents.filter((s) => (s.finalStatus || s.status) === 'Aprovado').length;
  const failed = validStudents.filter((s) => (s.finalStatus || s.status) === 'Reprovado').length;
  const recovery = validStudents.filter((s) => s.status === 'Recuperação' && !s.finalStatus).length;
  const highPerformers = validStudents.filter((s) => (s.mg || 0) > 8.0).length;
  const approvalRate = validStudents.length > 0 ? Number(((approved / validStudents.length) * 100).toFixed(1)) : 0;

  return {
    classAverage,
    quarterAverages,
    median,
    approved,
    failed,
    recovery,
    highPerformers,
    approvalRate,
  };
};

const calculateQuarterAverage = (students: Student[], quarter: 'bim1' | 'bim2' | 'bim3' | 'bim4'): number => {
  const validGrades = students.filter((s) => s[quarter] !== undefined).map((s) => s[quarter] as number);
  if (validGrades.length === 0) return 0;
  return Number((validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length).toFixed(2));
};

export const validateGrade = (value: string): { valid: boolean; error?: string } => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Nota deve ser um número' };
  }
  if (num < 0 || num > 10) {
    return { valid: false, error: 'Nota deve estar entre 0 e 10' };
  }
  return { valid: true };
};