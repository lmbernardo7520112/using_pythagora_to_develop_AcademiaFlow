// client/src/types.academic.ts


// --- Tipos para o Frontend (inclui campos calculados e nomes de campo de input) ---

export interface FrontendStudent {
  _id: string;
  name: string;
  number?: number;
  matricula: string;
  bim1?: number | null;
  bim2?: number | null;
  bim3?: number | null;
  bim4?: number | null;
  nf?: number | null;
  mg?: number | null;
  mf?: number | null;
  status?: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' | null;
  pf?: number | null;
  sf?: number | null;
  finalStatus?: 'Aprovado' | 'Reprovado' | 'Aguardando PF' | null | undefined;
  ativo?: boolean;
  transferido?: boolean;
  desistente?: boolean;
}

export type Student = FrontendStudent;

// ✅ Tipo alinhado ao backend (cada registro de nota)
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

// ✅ Estatísticas calculadas para o painel analítico
export interface ClassAnalytics {
  classAverage: number;
  quarterAverages: {
    bim1: number;
    bim2: number;
    bim3: number;
    bim4: number;
  };
  median: number;
  bimestreMedians: {
    bim1: number;
    bim2: number;
    bim3: number;
    bim4: number;
  };
  approved: number;
  failed: number;
  recovery: number;
  highPerformers: number;
  lowPerformers: number;
  approvalRate: number;
  approvalRatesByQuarter: {
    bim1: number;
    bim2: number;
    bim3: number;
    bim4: number;
  };

  // 🔹 Campos opcionais para compatibilidade retroativa
  mediaTurma?: number;
  taxaAprovacao?: number;
  aprovados?: number;
  reprovados?: number;
  recuperacao?: number;
  alunosAcima8?: number;
  mediana?: number;
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

// --- Tipos adicionais para dashboards da secretaria ---
export interface DashboardGeral {
  totalTurmas: number;
  totalAlunos: number;
  ativos: number;
  transferidos: number;
  desistentes: number;
  abandonos: number;
}

export interface TaxaAprovacaoTurma {
  aprovados: number;
  reprovados: number;
  total: number;
  taxa: number;
  taxaBim1?: number;
  taxaBim2?: number;
  taxaBim3?: number;
  taxaBim4?: number;
}

export interface TaxasAprovacao {
  turmas: Record<string, TaxaAprovacaoTurma>;
}

// --- Tipos para atividades geradas por IA ---
export interface AiActivity {
  _id: string;
  professorId: { _id: string; nome: string; email?: string };
  disciplinaId: { _id: string; nome: string };
  turmaId: { _id: string; nome: string };
  metadata: { tema: string; objetivos_aprendizagem?: string };
  tipo_atividade: string;
  nivel_dificuldade: string;
  quantidade: number;
  geradoEm: string;
  validado?: boolean;
  feedbackCoordenacao?: string;
}
