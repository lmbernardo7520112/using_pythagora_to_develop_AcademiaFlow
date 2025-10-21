import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Hook central para gerenciar atividades de IA no dashboard do professor.
 * Mantém todas as funcionalidades anteriores (gerar, buscar, revisar, excluir)
 * e adiciona integração com o endpoint de validação (feedback n8n).
 */
export const useAiActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 🔹 Busca todas as atividades geradas pelo professor autenticado
   */
  const fetchActivities = useCallback(async (professorId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/ai/atividades/${professorId}`);
      if (res.data?.success) {
        setActivities(res.data.data);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar atividades:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔹 Gera novas atividades via n8n e armazena no banco
   */
  const generateActivities = useCallback(async (payload: any) => {
    try {
      setLoading(true);
      const res = await axios.post(`/api/ai/gerarAtividade`, payload);
      if (res.data?.success) {
        setActivities((prev) => [res.data.data, ...prev]);
      }
    } catch (error) {
      console.error("❌ Erro ao gerar atividades:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔹 Marca uma atividade como revisada (sem feedback)
   */
  const markReviewed = useCallback(async (id: string) => {
    try {
      const res = await axios.patch(`/api/ai/atividades/${id}/revisar`);
      if (res.data?.success) {
        setActivities((prev) =>
          prev.map((a) => (a._id === id ? { ...a, revisado: true } : a))
        );
      }
    } catch (error) {
      console.error("❌ Erro ao marcar atividade revisada:", error);
    }
  }, []);

  /**
   * 🔹 Exclui uma atividade gerada
   */
  const deleteActivity = useCallback(async (id: string) => {
    try {
      const res = await axios.delete(`/api/ai/atividades/${id}`);
      if (res.data?.success) {
        setActivities((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (error) {
      console.error("❌ Erro ao excluir atividade:", error);
    }
  }, []);

  /**
   * 🔹 Valida uma atividade revisada com feedback do professor
   * (integração direta com aiFeedbackService)
   */
  const validateActivity = useCallback(async (payload: any) => {
    try {
      setLoading(true);
      const res = await axios.patch(`/api/ai/atividades/${payload.id}/validar`, payload);
      if (res.data?.success) {
        setActivities((prev) =>
          prev.map((a) =>
            a._id === payload.id ? { ...a, validado: true, ...res.data.data } : a
          )
        );
      }
    } catch (error) {
      console.error("❌ Erro ao validar atividade:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activities,
    loading,
    generateActivities,
    fetchActivities,
    markReviewed,
    deleteActivity,
    validateActivity,
  };
};

