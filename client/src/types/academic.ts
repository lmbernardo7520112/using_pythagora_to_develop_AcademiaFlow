//client/src/types.academic.ts

// --- Tipos para o Frontend (inclui campos calculados e nomes de campo de input) ---
export interface Student {
  _id: string; // ID do aluno (MongoDB ObjectId)
  nome: string; // Nome do aluno
  matricula: string; // Matrícula do aluno
  
  // Campos de notas para input no frontend (bim1, bim2, bim3, bim4)
  // Serão mapeados para avaliacao1, avaliacao2, avaliacao3, final no backend
  bim1?: number | null;
  bim2?: number | null;
  bim3?: number | null;
  bim4?: number | null; // Corresponde à 'final' do backend

  // Campos calculados no frontend (Nota Final, Média Geral, Média Final)
  nf?: number | null; // Nota Final (ex: média dos bims)
  mg?: number | null; // Média Geral (para decidir recuperação)
  mf?: number | null; // Média Final (após recuperação, se houver)

  // Situação do aluno
  situacao?: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' | null;

  // Campos de prova final (PF) e situação final (SF)
  pf?: number | null; // Nota da Prova Final
  sf?: number | null; // Situação após a prova final
  finalStatus?: 'Aprovado' | 'Reprovado' | null; // Status final após todo o processo
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