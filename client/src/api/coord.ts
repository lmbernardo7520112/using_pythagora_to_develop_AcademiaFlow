// client/src/api/coord.ts


import api from "./api";

/**
 * ==========================================================
 * 🎓 Módulo da Coordenação Pedagógica
 * ----------------------------------------------------------
 * Este módulo fornece funções para comunicação entre o
 * frontend e o backend relacionadas à coordenação pedagógica.
 * Mantém consistência total com o sistema atual e o setup do Axios.
 * ==========================================================
 */

/**
 * 🔹 Busca estatísticas gerais do painel da coordenação
 * Endpoint backend: GET /api/coord/dashboard
 */
export const getCoordDashboard = async () => {
  try {
    const response = await api.get("/coord/dashboard");
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar dashboard da coordenação:", error);
    throw error;
  }
};

/**
 * 🔹 Obtém a lista de atividades pendentes e validadas
 * Endpoint backend: GET /api/coord/atividades
 */
export const getCoordActivities = async () => {
  try {
    const response = await api.get("/coord/atividades");
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar atividades da coordenação:", error);
    throw error;
  }
};

/**
 * 🔹 Valida (ou rejeita) uma atividade
 * Endpoint backend: PATCH /api/coord/atividades/:id/validar
 */
export const validateActivity = async (id: string, data: any) => {
  try {
    const response = await api.patch(`/coord/atividades/${id}/validar`, data);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao validar atividade ${id}:`, error);
    throw error;
  }
};
