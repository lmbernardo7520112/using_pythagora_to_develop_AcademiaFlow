// client/src/api/coord.ts

import api from "./api";

/**
 * ==========================================================
 * 🎓 Módulo da Coordenação Pedagógica
 * ==========================================================
 */

/** 🔹 Estatísticas do painel da coordenação */
export const getCoordDashboard = async () => {
  const { data } = await api.get("/coord/dashboard");
  // backend envia { success, data: {...} } → devolvemos só o {...}
  return data?.data ?? data ?? {};
};

/** 🔹 Lista de atividades (pendentes por padrão) */
export const getCoordActivities = async () => {
  const { data } = await api.get("/coord/atividades");
  // backend envia { success, data: [...] } → devolvemos só o array
  return data?.data ?? [];
};

/** 🔹 Validar (ou rejeitar) uma atividade */
export const validateActivity = async (id: string, payload: any) => {
  const { data } = await api.patch(`/coord/atividades/${id}/validar`, payload);
  return data;
};
