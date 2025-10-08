// client/src/types.academic.ts


// --- Tipos para o Frontend (inclui campos calculados e nomes de campo de input) ---
// ✅ Mantém o nome FrontendStudent, mas agora também exporta alias Student para compatibilidade
export interface FrontendStudent {
  _id: string; // ID do aluno (MongoDB ObjectId)
  name: string; // Nome do aluno - corresponde a item.nome no backend
  number?: number; // Número do aluno na lista
  matricula: string;

  // Campos de notas
  bim1?: number | null;
  bim2?: number | null;
  bim3?: number | null;
  bim4?: number | null;

  // Campos calculados
  nf?: number | null;
  mg?: number | null;
  mf?: number | null;

  // Situação geral
  status?: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' | null;

  // Campos de prova final
  pf?: number | null;
  sf?: number | null;
  finalStatus?: 'Aprovado' | 'Reprovado' | null;
}

// ✅ Alias para compatibilidade com imports antigos
export type Student = FrontendStudent;

// ✅ Tipo representando cada item retornado pela API do backend
export interface BackendGradeInfo {
  _id: string;
  nome: string;
  matricula: string;
  notas: {
    avaliacao1: number | null;
    avaliacao2: number | null;
    avaliacao3: number | null;
    avaliacao4?: number | null;
    pf: number | null;
    final: number | null;
  };
  media: number | null;
  situacao: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' | null;
  alunoId?: string;
  disciplinaId?: string;
  turmaId?: string;
}

// Estatísticas calculadas para a turma — usadas no painel analítico
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


// --- Tipos para Disciplinas e Turmas ---
export interface ProfessorDisciplineWithTurmas {
  _id: string;
  nome: string;
  codigo: string;
  professorId: string;
  professorName: string;
  turmas: {
    _id: string;
    nome: string;
    ano: number;
  }[];
}

export interface DisciplineClass {
  _id: string;
  disciplineName: string;
  disciplineCode: string;
  professorEmail: string;
  turmas: {
    _id: string;
    nome: string;
    academicYear: number;
  }[];
}

// --- Payload de atualização de notas ---
export interface GradeUpdatePayload {
  alunoId: string;
  avaliacaoType: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final' | 'pf';
  nota: number | null;
}
