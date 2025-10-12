// client/src/api/relatorios.ts
import api from "./api";

export const getTaxasPorTurma = async (bimestre?: number) =>
  api.get("/secretaria/relatorios/taxas", { params: bimestre ? { bimestre } : {} });

export const listAlunosRelatorio = async (params: {
  turmaId?: string;
  nome?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
}) => api.get("/secretaria/relatorios/alunos", { params });

export const exportRelatorioXlsx = async (turmaId?: string) =>
  api.get("/secretaria/relatorios/export/xlsx", {
    params: turmaId ? { turmaId } : {},
    responseType: "arraybuffer",
  });
