//client/src/utils/gradeCalculations.ts

// client/src/utils/gradeCalculations.ts

import { Student, ClassAnalytics } from '@/types/academic';

/**
 * ✅ Harmonizado com backend:
 * - PASS_THRESHOLD = 6.0
 * - RECOVERY_THRESHOLD = 4.0
 * 
 * Inclui atualização automática da Situação Final (SF)
 * ao preencher o campo PF.
 */

const PASS_THRESHOLD = 6.0;
const RECOVERY_THRESHOLD = 4.0;

const round2 = (v: number) => Number(v.toFixed(2));

/**
 * Calcula NF (nota final) com base nas notas bimestrais.
 */
export const calculateNF = (
  bim1?: number,
  bim2?: number,
  bim3?: number,
  bim4?: number
): number | undefined => {
  const grades = [bim1, bim2, bim3, bim4].filter((g) => typeof g === 'number') as number[];
  if (grades.length === 0) return undefined;
  return round2(grades.reduce((sum, g) => sum + g, 0) / grades.length);
};

/**
 * MG é equivalente à NF (média geral).
 */
export const calculateMG = (nf?: number): number | undefined => {
  return nf;
};

/**
 * Calcula MF (média final), considerando PF se necessário.
 */
export const calculateMF = (mg?: number, pf?: number): number | undefined => {
  if (mg === undefined) return undefined;
  if (mg >= PASS_THRESHOLD) return mg;
  if (pf !== undefined && !isNaN(pf)) {
    return round2((mg + pf) / 2);
  }
  return mg;
};

/**
 * Determina o status parcial do aluno (antes da PF).
 */
export const calculateStatus = (
  mg?: number
): 'Aprovado' | 'Recuperação' | 'Reprovado' | undefined => {
  if (mg === undefined) return undefined;
  if (mg >= PASS_THRESHOLD) return 'Aprovado';
  if (mg >= RECOVERY_THRESHOLD) return 'Recuperação';
  return 'Reprovado';
};

/**
 * Determina a Situação Final (SF) considerando PF.
 * - Se MG >= 6 → Aprovado direto
 * - Se MG < 6 e PF lançado → MF decide aprovação
 * - Se MG < 6 e PF ausente → Aguardando PF
 */
export const calculateFinalStatus = (
  mf?: number,
  mg?: number,
  pf?: number
): 'Aprovado' | 'Reprovado' | 'Aguardando PF' | undefined => {
  if (mg === undefined) return undefined;
  if (mg >= PASS_THRESHOLD) return 'Aprovado';
  if (pf === undefined || pf === null) return 'Aguardando PF';
  if (mf === undefined) return undefined;
  return mf >= PASS_THRESHOLD ? 'Aprovado' : 'Reprovado';
};

/**
 * Indica se o aluno precisa realizar a PF.
 */
export const needsRecoveryExam = (mg?: number): boolean => {
  if (mg === undefined) return false;
  return mg < PASS_THRESHOLD && mg >= RECOVERY_THRESHOLD;
};

/**
 * Recalcula todas as notas e status de um aluno.
 * Agora com lógica de atualização automática da Situação Final (SF).
 */
export const recalculateStudent = (student: Student): Student => {
  const nf = calculateNF(
    student.bim1 ?? undefined,
    student.bim2 ?? undefined,
    student.bim3 ?? undefined,
    student.bim4 ?? undefined
  );

  const mg = calculateMG(nf);
  const status = calculateStatus(mg);
  const mf = calculateMF(mg, student.pf ?? undefined);
  const finalStatus = calculateFinalStatus(mf, mg, student.pf ?? undefined);

  return {
    ...student,
    nf,
    mg,
    mf,
    status,
    finalStatus,
  };
};

/**
 * Calcula métricas e estatísticas de desempenho da turma.
 */
export const calculateClassAnalytics = (students: Student[]): ClassAnalytics => {
  const validStudents = students.filter((s) => s.mg !== undefined);

  const classAverage =
    validStudents.length > 0
      ? Number((validStudents.reduce((sum, s) => sum + (s.mg || 0), 0) / validStudents.length).toFixed(2))
      : 0;

  const quarterAverages = {
    bim1: calculateQuarterAverage(students, 'bim1'),
    bim2: calculateQuarterAverage(students, 'bim2'),
    bim3: calculateQuarterAverage(students, 'bim3'),
    bim4: calculateQuarterAverage(students, 'bim4'),
  };

  // 🔹 Novos campos obrigatórios — medianas por bimestre
  const bimestreMedians = {
    bim1: calculateQuarterMedian(students, 'bim1'),
    bim2: calculateQuarterMedian(students, 'bim2'),
    bim3: calculateQuarterMedian(students, 'bim3'),
    bim4: calculateQuarterMedian(students, 'bim4'),
  };

  const sortedGrades = validStudents.map((s) => s.mg || 0).sort((a, b) => a - b);
  const median =
    sortedGrades.length > 0
      ? sortedGrades.length % 2 === 0
        ? Number(((sortedGrades[sortedGrades.length / 2 - 1] + sortedGrades[sortedGrades.length / 2]) / 2).toFixed(2))
        : sortedGrades[Math.floor(sortedGrades.length / 2)]
      : 0;

  const approved = validStudents.filter((s) => (s.finalStatus || s.status) === 'Aprovado').length;
  const failed = validStudents.filter((s) => (s.finalStatus || s.status) === 'Reprovado').length;
  const recovery = validStudents.filter((s) => s.status === 'Recuperação' && !s.finalStatus).length;

  const highPerformers = validStudents.filter((s) => (s.mg || 0) > 8.0).length;
  const lowPerformers = validStudents.filter((s) => (s.mg || 0) < 4.0).length;

  const approvalRate =
    validStudents.length > 0 ? Number(((approved / validStudents.length) * 100).toFixed(1)) : 0;

  const approvalRatesByQuarter = {
    bim1: calculateApprovalRateByQuarter(students, 'bim1'),
    bim2: calculateApprovalRateByQuarter(students, 'bim2'),
    bim3: calculateApprovalRateByQuarter(students, 'bim3'),
    bim4: calculateApprovalRateByQuarter(students, 'bim4'),
  };

  return {
    classAverage,
    quarterAverages,
    bimestreMedians,
    median,
    approved,
    failed,
    recovery,
    highPerformers,
    lowPerformers,
    approvalRate,
    approvalRatesByQuarter,
  };
};

/**
 * Média do bimestre.
 */
const calculateQuarterAverage = (
  students: Student[],
  quarter: 'bim1' | 'bim2' | 'bim3' | 'bim4'
): number => {
  const validGrades = students
    .filter((s) => s[quarter] !== undefined && s[quarter] !== null)
    .map((s) => s[quarter] as number);
  if (validGrades.length === 0) return 0;
  return Number((validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length).toFixed(2));
};

/**
 * Mediana do bimestre.
 */
const calculateQuarterMedian = (
  students: Student[],
  quarter: 'bim1' | 'bim2' | 'bim3' | 'bim4'
): number => {
  const validGrades = students
    .filter((s) => s[quarter] !== undefined && s[quarter] !== null)
    .map((s) => s[quarter] as number)
    .sort((a, b) => a - b);
  if (validGrades.length === 0) return 0;
  const mid = Math.floor(validGrades.length / 2);
  return validGrades.length % 2 === 0
    ? Number(((validGrades[mid - 1] + validGrades[mid]) / 2).toFixed(2))
    : validGrades[mid];
};

/**
 * Taxa de aprovação por bimestre.
 */
const calculateApprovalRateByQuarter = (
  students: Student[],
  quarter: 'bim1' | 'bim2' | 'bim3' | 'bim4'
): number => {
  const validGrades = students
    .filter((s) => s[quarter] !== undefined && s[quarter] !== null)
    .map((s) => s[quarter] as number);
  if (validGrades.length === 0) return 0;

  const approvedCount = validGrades.filter((g) => g >= PASS_THRESHOLD).length;
  return Number(((approvedCount / validGrades.length) * 100).toFixed(1));
};

/**
 * Validação de nota individual.
 */
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
