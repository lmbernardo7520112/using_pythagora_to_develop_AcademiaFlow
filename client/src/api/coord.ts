// client/src/api/coord.ts
import api from "./api";

/**
 * 🔹 Busca estatísticas gerais da coordenação (dashboard)
 */
export const getCoordDashboard = () => {
  return api.get("/coord/dashboard");
};

/**
 * 🔹 Lista de atividades pendentes e validadas
 */
export const getCoordActivities = () => {
  return api.get("/coord/atividades");
};

/**
 * 🔹 Valida uma atividade (feedback da coordenação)
 */
export const validateActivity = (id: string, data: any) => {
  return api.patch(`/coord/atividades/${id}/validar`, data);
};
