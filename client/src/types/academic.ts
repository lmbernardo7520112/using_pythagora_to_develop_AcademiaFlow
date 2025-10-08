// client/src/types.academic.ts

// --- Tipos para o Frontend (inclui campos calculados e nomes de campo de input) ---
// ✅ CORREÇÃO: Renomeado para FrontendStudent para clareza e para corresponder à importação em grades.ts
// Alternativamente, poderíamos mudar a importação em grades.ts de 'FrontendStudent' para 'Student'.
// Optei por renomear aqui para manter a importação em grades.ts como está.
export interface FrontendStudent {
  _id: string; // ID do aluno (MongoDB ObjectId) - CORRESPONDE a item._id na API
  name: string; // Nome do aluno - CORRESPONDE a item.nome na API
  number?: number; // Número do aluno na lista (gerado no frontend)
  matricula: string; // Matrícula do aluno - CORRESPONDE a item.matricula na API
  
  // Campos de notas para input no frontend (bim1, bim2, bim3, bim4)
  // Serão mapeados para avaliacao1, avaliacao2, avaliacao3, final no backend
  bim1?: number | null; // CORRESPONDE a item.notas.avaliacao1
  bim2?: number | null; // CORRESPONDE a item.notas.avaliacao2
  bim3?: number | null; // CORRESPONDE a item.notas.avaliacao3
  bim4?: number | null; // CORRESPONDE a item.notas.final do backend (final de disciplina)

  // Campos calculados no frontend (Nota Final, Média Geral, Média Final)
  nf?: number | null; // Nota Final (ex: média dos bims) - CORRESPONDE a item.media
  mg?: number | null; // Média Geral (para decidir recuperação) - CORRESPONDE a item.media
  mf?: number | null; // Média Final (após recuperação, se houver) - CORRESPONDE a item.media

  // Situação do aluno
  status?: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' | null; // CORRESPONDE a item.situacao

  // Campos de prova final (PF) e situação final (SF)
  pf?: number | null; // Nota da Prova Final - CORRESPONDE a item.notas.pf
  sf?: number | null; // Situação após a prova final
  finalStatus?: 'Aprovado' | 'Reprovado' | null; // Status final após todo o processo
}

// ✅ NOVO TIPO: BackendGradeInfo
// Este tipo representa o formato de CADA ITEM retornado pela API GET /api/notas/:turmaId/:disciplinaId
// É uma combinação dos dados da Nota com os dados do Aluno (provavelmente via populate ou aggregate no backend)
export interface BackendGradeInfo {
  _id: string; // ID da Nota no MongoDB (se for o ID da Nota) ou o ID do Aluno (se o endpoint estiver retornando dados do aluno e aninhando a nota)
                // Assumindo que é o ID da Nota, mas o FrontendGradeManagement mapeia para _id do aluno.
                // Idealmente, este seria o ID do ALUNO, se o retorno da API for uma agregação.
  
  // Dados do aluno, populados junto com a nota
  nome: string; // Nome do aluno
  matricula: string; // Matrícula do aluno

  // O objeto 'notas' que contém as avaliações individuais e PF
  notas: {
    avaliacao1: number | null;
    avaliacao2: number | null;
    avaliacao3: number | null;
    avaliacao4: number | null; // Se existir no backend para algum outro fim, senão, 'final' é o 4º bimestre
    pf: number | null; // Prova Final
    final: number | null; // Nota Final da disciplina (média dos bimestres, etc.)
  };
  
  media: number | null; // Média geral calculada no backend
  situacao: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' | null; // Situação do aluno calculada no backend

  // Outros campos que podem vir do backend (dependendo do populate/aggregate)
  alunoId?: string; // O ID real do aluno, se o _id principal for o da Nota
  disciplinaId?: string; // ID da disciplina
  turmaId?: string; // ID da turma
}


// --- Tipos para Disciplinas e Turmas (como recebido do backend para o Dashboard) ---

// Este é o tipo exato que o backend retorna para as disciplinas do professor
// (conforme o console.log em server/routes/professorRoutes.ts e server/services/professorService.ts)
export interface ProfessorDisciplineWithTurmas {
  _id: string; // ID da disciplina
  nome: string; // Nome da disciplina
  codigo: string; // Código da disciplina
  professorId: string;
  professorName: string; // Nome/email do professor (usado para exibir "Professor: email")
  turmas: {
    _id: string; // ID da turma
    nome: string; // Nome da turma
    ano: number; // Ano da turma
  }[];
}

// ✅ CORREÇÃO: Redefinindo DisciplineClass para ser como ProfessorDisciplineWithTurmas
// Isso permite que o DisciplineCard mostre a disciplina e TODAS as suas turmas,
// alinhando-se com o layout da imagem que você forneceu.
export interface DisciplineClass {
  _id: string; // ID da DISCIPLINA
  disciplineName: string; // nome da disciplina
  disciplineCode: string; // código da disciplina
  professorEmail: string; // email do professor (corresponde a 'professorName' em ProfessorDisciplineWithTurmas)
  
  // Array de turmas associadas a esta disciplina
  turmas: {
    _id: string; // ID da turma
    nome: string; // Nome da turma
    academicYear: number; // Ano letivo da turma (corresponde a 'ano' em ProfessorDisciplineWithTurmas)
  }[];
}


// --- Tipos para requisições de API (o payload para salvar notas) ---

// Payload para um único update de nota que o backend espera
export interface GradeUpdatePayload {
  alunoId: string;
  avaliacaoType: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final' | 'pf'; 
  nota: number | null;
}