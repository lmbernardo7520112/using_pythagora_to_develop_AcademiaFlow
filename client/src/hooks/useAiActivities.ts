//client/src/hooks/useAiActivities.ts

import { useState, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Hook central para gerenciar atividades de IA no dashboard do professor.
 * ✅ Mantém todas as funcionalidades anteriores e adiciona robustez:
 * - Evita chamadas duplicadas (refetch controlado)
 * - Corrige concorrência de estado entre geração e revisão
 * - Melhora o tratamento de erros e logs de depuração
 */
export const useAiActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedId = useRef<string | null>(null);

  /**
   * 🔹 Busca todas as atividades geradas pelo professor autenticado
   * Garante que a busca não repita chamadas desnecessárias
   */
  const fetchActivities = useCallback(async (professorId: string) => {
    if (!professorId) return;

    // Evita chamadas duplicadas para o mesmo ID de professor
    if (lastFetchedId.current === professorId) {
      console.info(`[useAiActivities] Atividades já carregadas para o professor ${professorId}`);
      return;
    }

    try {
      setLoading(true);
      console.info(`[useAiActivities] Fetching activities for professor: ${professorId}`);

      const res = await axios.get(`/api/ai/atividades/${professorId}`);

      if (res.data?.success && Array.isArray(res.data.data)) {
        setActivities(res.data.data);
        lastFetchedId.current = professorId;
        console.info(`[useAiActivities] ${res.data.data.length} atividades carregadas.`);
      } else {
        console.warn(`[useAiActivities] Nenhuma atividade encontrada ou formato inesperado.`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao buscar atividades:", error?.message || error);
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

      if (res.data?.success && res.data.data) {
        setActivities((prev) => [res.data.data, ...prev]);
        console.info("✅ Nova atividade gerada e adicionada à lista.");
      } else {
        console.warn("⚠️ Resposta inesperada ao gerar atividade:", res.data);
      }
    } catch (error: any) {
      console.error("❌ Erro ao gerar atividades:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔹 Marca uma atividade como revisada (sem feedback completo)
   */
  const markReviewed = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const res = await axios.patch(`/api/ai/atividades/${id}/revisar`);

      if (res.data?.success) {
        setActivities((prev) =>
          prev.map((a) =>
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

      if (res.data?.success) {
        setActivities((prev) => prev.filter((a) => a._id !== id));
        console.info(`🗑️ Atividade ${id} excluída com sucesso.`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao excluir atividade:", error?.message || error);
    }
  }, []);

  /**
   * 🔹 Valida uma atividade revisada com feedback do professor
   * Atualiza o estado local imediatamente após a confirmação do backend
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

      if (res.data?.success) {
        setActivities((prev) =>
          prev.map((a) =>
            a._id === payload.id
              ? {
                  ...a,
                  validado: true,
                  feedbackProfessor: payload.feedbackProfessor,
                  qualidadeIA: payload.qualidadeIA,
                  comentario: payload.comentario,
                  revisadoEm: new Date().toISOString(),
                  ...res.data.data,
                }
              : a
          )
        );
        console.info(`✅ Atividade ${payload.id} validada com sucesso.`);
      } else {
        console.warn(`⚠️ Falha na validação da atividade ${payload.id}:`, res.data);
      }
    } catch (error: any) {
      console.error("❌ Erro ao validar atividade:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔹 Permite resetar o estado interno manualmente (para debugging ou logout)
   */
  const resetActivities = useCallback(() => {
    setActivities([]);
    lastFetchedId.current = null;
    console.info("[useAiActivities] Estado de atividades resetado.");
  }, []);

  // Retorna API pública do hook
  return {
    activities,
    loading,
    generateActivities,
    fetchActivities,
    markReviewed,
    deleteActivity,
    validateActivity,
    resetActivities, // opcional, mas útil para futuras integrações
  };
};
