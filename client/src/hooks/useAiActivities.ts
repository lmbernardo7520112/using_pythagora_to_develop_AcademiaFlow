import { useState, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Hook central para gerenciar atividades de IA no dashboard do professor.
 * Mantém todas as funcionalidades anteriores e elimina loops de chamadas.
 */
export const useAiActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Controle de refetch para evitar repetições indesejadas
  const lastFetchedId = useRef<string | null>(null);

  /**
   * 🔹 Busca todas as atividades geradas pelo professor autenticado
   */
  const fetchActivities = useCallback(async (professorId: string) => {
    if (!professorId) return;

    // Evita chamadas duplicadas para o mesmo ID
    if (lastFetchedId.current === professorId) {
      console.info(`[useAiActivities] Atividades já carregadas para o professor ${professorId}`);
      return;
    }

    try {
      setLoading(true);
      console.info(`[useAiActivities] Fetching activities for professor: ${professorId}`);
      const res = await axios.get(`/api/ai/atividades/${professorId}`);

      if (res.data?.success) {
        setActivities(res.data.data);
        lastFetchedId.current = professorId;
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
      console.info(`[useAiActivities] Enviando payload para geração de atividade...`);
      const res = await axios.post(`/api/ai/gerarAtividade`, payload);

      if (res.data?.success) {
        setActivities((prev) => [res.data.data, ...prev]);
        console.info("✅ Nova atividade gerada e adicionada à lista.");
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
