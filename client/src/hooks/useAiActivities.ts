//client/src/hooks/useAiActivities.ts
import { useState, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Hook central para gerenciar atividades de IA no dashboard do professor.
 * ✅ Mantém todas as funcionalidades anteriores e adiciona robustez:
 * - Evita chamadas duplicadas (refetch controlado)
 * - Corrige concorrência de estado entre geração, revisão e validação
 * - Trata diferentes formatos de resposta do backend (array direto ou { success, data })
 * - Melhora o tratamento de erros e logs de depuração
 */
export const useAiActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Controle de refetch para evitar repetições desnecessárias
  const lastFetchedId = useRef<string | null>(null);

  /**
   * 🔧 Normaliza a resposta da API para sempre entregar um array
   */
  const normalizeActivitiesResponse = (res: any): any[] => {
    if (Array.isArray(res?.data)) return res.data;
    if (res?.data?.success && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;

    console.warn("[useAiActivities] Resposta inesperada do backend:", res?.data);
    return [];
  };

  /**
   * 🔹 Busca todas as atividades geradas pelo professor autenticado
   * Retorna o array de atividades para permitir await no front.
   */
  const fetchActivities = useCallback(async (professorId: string) => {
    if (!professorId) return [];

    if (lastFetchedId.current === professorId && activities.length > 0) {
      console.info(`[useAiActivities] Cache ativo para professor ${professorId}`);
      return activities;
    }

    try {
      setLoading(true);
      console.info(`[useAiActivities] Fetching activities for professor: ${professorId}`);

      const res = await axios.get(`/api/ai/atividades/${professorId}`);
      const list = normalizeActivitiesResponse(res);

      setActivities(list);
      lastFetchedId.current = professorId;
      console.info(`[useAiActivities] ${list.length} atividades carregadas.`);
      return list; // ✅ Retorna o array para uso no front
    } catch (error: any) {
      console.error("❌ Erro ao buscar atividades:", error?.message || error);
      setActivities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [activities.length]);

  /**
   * 🔹 Gera novas atividades via n8n e armazena no banco
   */
  const generateActivities = useCallback(async (payload: any) => {
    try {
      setLoading(true);
      console.info("[useAiActivities] Enviando payload para geração de atividade...");

      const res = await axios.post(`/api/ai/gerarAtividade`, payload);
      const created = res?.data?.success ? res.data.data : res?.data;

      if (created && created._id) {
        setActivities((prev) => [created, ...(prev || [])]);
        console.info("✅ Nova atividade gerada e adicionada à lista.");
      } else {
        console.warn("⚠️ Resposta inesperada ao gerar atividade:", res?.data);
      }
    } catch (error: any) {
      console.error("❌ Erro ao gerar atividades:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔹 Marca uma atividade como revisada
   */
  const markReviewed = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const res = await axios.patch(`/api/ai/atividades/${id}/revisar`);
      const ok = res?.data?.success === true || (res?.status >= 200 && res?.status < 300);

      if (ok) {
        setActivities((prev) =>
          (prev || []).map((a) =>
            a._id === id ? { ...a, revisado: true, revisadoEm: new Date().toISOString() } : a
          )
        );
        console.info(`📝 Atividade ${id} marcada como revisada.`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao marcar atividade revisada:", error?.message || error);
    }
  }, []);

  /**
   * 🔹 Exclui uma atividade gerada
   */
  const deleteActivity = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const res = await axios.delete(`/api/ai/atividades/${id}`);
      const ok = res?.data?.success === true || (res?.status >= 200 && res?.status < 300);

      if (ok) {
        setActivities((prev) => (prev || []).filter((a) => a._id !== id));
        console.info(`🗑️ Atividade ${id} excluída com sucesso.`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao excluir atividade:", error?.message || error);
    }
  }, []);

  /**
   * 🔹 Valida uma atividade revisada com feedback do professor
   */
  const validateActivity = useCallback(async (payload: any) => {
    if (!payload?.id) {
      console.warn("⚠️ Nenhum ID de atividade fornecido para validação.");
      return;
    }

    try {
      setLoading(true);
      console.info(`[useAiActivities] Validando atividade ${payload.id}...`);

      const res = await axios.patch(`/api/ai/atividades/${payload.id}/validar`, payload);
      const ok = res?.data?.success === true || (res?.status >= 200 && res?.status < 300);

      if (ok) {
        const updated = res?.data?.data || {};
        setActivities((prev) =>
          (prev || []).map((a) =>
            a._id === payload.id
              ? {
                  ...a,
                  validado: true,
                  feedbackProfessor: payload.feedbackProfessor,
                  qualidadeIA: payload.qualidadeIA,
                  comentario: payload.comentario,
                  revisadoEm: new Date().toISOString(),
                  ...updated,
                }
              : a
          )
        );
        console.info(`✅ Atividade ${payload.id} validada com sucesso.`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao validar atividade:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔹 Reseta o estado interno (para debugging ou logout)
   */
  const resetActivities = useCallback(() => {
    setActivities([]);
    lastFetchedId.current = null;
    console.info("[useAiActivities] Estado de atividades resetado.");
  }, []);

  console.log("[DEBUG] Atividades recebidas:", activities);
  (window as any).lastActivities = activities;

  return {
    activities,
    loading,
    generateActivities,
    fetchActivities,
    markReviewed,
    deleteActivity,
    validateActivity,
    resetActivities,
  };
};
