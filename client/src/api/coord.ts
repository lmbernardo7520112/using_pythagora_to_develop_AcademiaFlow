// client/src/api/coord.ts

// client/src/api/coord.ts
import api from "./api";

/**
 * ==========================================================
 * 🎓 Módulo da Coordenação Pedagógica
 * ==========================================================
 */

/** 🔹 Dashboard principal */
export const getCoordDashboard = async () => {
  const response = await api.get("/coord/dashboard");
  return response.data;
};

/** 🔹 Lista de atividades pendentes */
export const getCoordActivities = async () => {
  const response = await api.get("/coord/atividades");
  return response.data;
};

/** 🔹 Valida (ou rejeita) uma atividade */
export const validateActivity = async (id: string, data: any) => {
  const response = await api.patch(`/coord/atividades/${id}/validar`, data);
  return response.data;
};
