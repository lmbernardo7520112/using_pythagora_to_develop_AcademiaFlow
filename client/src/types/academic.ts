//client/src/types.academic.ts
export interface Student {
  _id: string;
  number: number;
  name: string;
  bim1?: number;
  bim2?: number;
  bim3?: number;
  bim4?: number;
  nf?: number;
  mg?: number;
  mf?: number;
  status?: 'Aprovado' | 'Recuperação' | 'Reprovado';
  pf?: number;
  sf?: number;
  finalStatus?: 'Aprovado' | 'Reprovado';
}

export interface DisciplineClass {
  _id: string;
  disciplineName: string;
  disciplineCode: string;
  className: string;
  academicYear: string;
  teacherId: string;
  teacherName: string;
}

export interface GradeData {
  disciplineClass: DisciplineClass;
  students: Student[];
}

export interface ClassAnalytics {
  classAverage: number;
  quarterAverages: {
    bim1: number;
    bim2: number;
    bim3: number;
    bim4: number;
  };
  median: number;
  approved: number;
  failed: number;
  recovery: number;
  highPerformers: number;
  approvalRate: number;
}