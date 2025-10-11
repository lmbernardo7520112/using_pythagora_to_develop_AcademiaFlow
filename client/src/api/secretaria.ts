// client/src/api/secretaria.ts
import api from "./api";
import { AxiosResponse } from "axios";

export interface TurmaDTO {
  _id: string;
  nome: string;
  ano: number;
  professor?: { _id: string; name?: string; email?: string };
  disciplinas?: { _id: string; nome?: string }[];
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
}

/**
 * Dashboard geral
 */
export const getDashboardGeral = async (): Promise<AxiosResponse> =>
  api.get("/secretaria/dashboard");

/**
 * Turmas
 */
export const getTurmas = async (): Promise<AxiosResponse<TurmaDTO[]>> =>
  api.get("/secretaria/turmas");

export const getTurmaById = async (id: string): Promise<AxiosResponse<TurmaDTO>> =>
  api.get(`/secretaria/turmas/${id}`);

/**
 * Alunos
 */
export const getAlunosByTurma = async (turmaId: string): Promise<AxiosResponse<AlunoDTO[]>> =>
  api.get(`/secretaria/turmas/${turmaId}/alunos`);

/**
 * Taxas de aprovação
 */
export const getTaxasAprovacao = async (bimestre?: number): Promise<AxiosResponse> =>
  api.get("/secretaria/taxas-aprovacao", { params: bimestre ? { bimestre } : {} });
