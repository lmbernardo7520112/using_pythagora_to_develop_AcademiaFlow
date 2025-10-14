// client/src/api/secretaria.ts

import api from "./api";
import { AxiosResponse } from "axios";

/* ==========================================================
   📘 Tipos principais
========================================================== */

export interface TurmaDTO {
  _id: string;
  nome: string;
  ano: number;
  professor?: { _id: string; nome?: string; email?: string };
  disciplinas?: { _id: string; nome?: string; codigo?: string }[];
  alunos?: any[];
  ativo?: boolean;
}

export interface AlunoDTO {
  _id: string;
  nome: string;
  matricula: string;
  email: string;
  turma: string;
  ativo: boolean;
  transferido?: boolean;
  desistente?: boolean;
}

export interface DashboardGeralDTO {
  totalTurmas: number;
  totalAlunos: number;
  ativos: number;
  transferidos: number;
  desistentes: number;
  abandonos: number;
}

export interface TaxaAprovacaoTurmaDTO {
  aprovados: number;
  reprovados: number;
  total: number;
  taxa: string; // e.g., '85.71%'
  taxaBim1?: number;
  taxaBim2?: number;
  taxaBim3?: number;
  taxaBim4?: number;
}

export interface TaxasAprovacaoDTO {
  turmas: Record<string, TaxaAprovacaoTurmaDTO>;
}

/* ==========================================================
   🧾 Dashboard geral
========================================================== */
export const getDashboardGeral = async (): Promise<
  AxiosResponse<DashboardGeralDTO>
> => api.get("/secretaria/dashboard");

/* ==========================================================
   🎓 Turmas
========================================================== */
export const getTurmas = async (): Promise<AxiosResponse<TurmaDTO[]>> =>
  api.get("/secretaria/turmas");

export const getTurmaById = async (
  id: string
): Promise<AxiosResponse<TurmaDTO>> =>
  api.get(`/secretaria/turmas/${id}`);

/* ==========================================================
   👩‍🎓 Alunos
========================================================== */
export const getAlunosByTurma = async (
  turmaId: string
): Promise<AxiosResponse<AlunoDTO[]>> =>
  api.get(`/secretaria/turmas/${turmaId}/alunos`);

/* ==========================================================
   📚 Disciplinas
========================================================== */
export interface DisciplinaDTO {
  _id: string;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  ativo: boolean;
  professor?: { _id?: string; nome?: string; email?: string } | null;
  turma?: { _id?: string; nome?: string; ano?: number } | null;
}

export const getDisciplinas = async (): Promise<
  AxiosResponse<DisciplinaDTO[]>
> => api.get("/secretaria/disciplinas");

/* ==========================================================
   📈 Taxas de aprovação
========================================================== */
export const getTaxasAprovacao = async (
  bimestre?: number
): Promise<AxiosResponse<TaxasAprovacaoDTO>> =>
  api.get("/secretaria/taxas-aprovacao", {
    params: bimestre ? { bimestre } : {},
  });

/* ==========================================================
   📊 Relatórios gerais da secretaria
========================================================== */
export interface RelatorioDTO {
  totalTurmas: number;
  totalAlunos: number;
  mediaGeral: number;
  taxaAprovacao: number;
  desempenhoPorTurma: { turma: string; media: number }[];
}

export const getRelatorios = async (): Promise<
  AxiosResponse<RelatorioDTO>
> => api.get("/secretaria/relatorios");
