//client/src/hooks/useAiActivities.ts

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook central para gerenciar atividades de IA no dashboard do professor.
 * ✅ Totalmente sincronizado com AuthContext e localStorage.
 * ✅ Fallback automático se Auth ainda não estiver pronto.
 * ✅ Logs coloridos preservados e organizados.
 */
export const useAiActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedId = useRef<string | null>(null);

  const styles = {
    info: "color:#00bcd4;font-weight:bold",
    success: "color:#4caf50;font-weight:bold",
    warn: "color:#ff9800;font-weight:bold",
    error: "color:#f44336;font-weight:bold",
    dim: "color:gray",
  };

  /* ============================================================
     🔹 Recupera o usuário atual com fallback do localStorage
  ============================================================ */
  const getActiveUser = (): { id?: string; nome?: string } | null => {
    if (user?._id && user?.nome) return { id: user._id, nome: user.nome };
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?._id && parsed?.nome) return { id: parsed._id, nome: parsed.nome };
      }
    } catch (err) {
      console.error("%c[useAiActivities]%c Falha ao recuperar user do localStorage:", styles.error, styles.dim, err);
    }
    return null;
  };

  /* ============================================================
     🔧 Normaliza a resposta da API para sempre entregar um array
  ============================================================ */
  const normalizeActivitiesResponse = (res: any): any[] => {
    if (Array.isArray(res?.data)) return res.data;
    if (res?.data?.success && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;

    console.warn("%c[useAiActivities]%c Resposta inesperada do backend:", styles.warn, styles.dim, res?.data);
    return [];
  };

  /* ============================================================
     🔹 Busca atividades do professor autenticado
  ============================================================ */
  const fetchActivities = useCallback(async (professorId?: string) => {
    const activeUser = getActiveUser();
    const id = professorId || activeUser?.id;
    if (!id) {
      console.warn("%c[useAiActivities]%c Nenhum professor disponível para buscar atividades.", styles.warn, styles.dim);
      return [];
    }

    if (lastFetchedId.current === id && activities.length > 0) {
      console.log("%c[useAiActivities]%c Cache ativo para professor %s", styles.info, styles.dim, id);
      return activities;
    }

    try {
      setLoading(true);
      console.log("%c[useAiActivities]%c Buscando atividades do professor: %s", styles.info, styles.dim, id);

      const res = await axios.get(`/api/ai/atividades/${id}`);
      const list = normalizeActivitiesResponse(res);
      setActivities(list);
      lastFetchedId.current = id;
      console.log("%c[useAiActivities]%c %d atividades carregadas.", styles.success, styles.dim, list.length);
      return list;
    } catch (error: any) {
      console.error("%c❌ Erro ao buscar atividades:%c %s", styles.error, styles.dim, error?.message || error);
      setActivities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [activities.length]);

  /* ============================================================
     🔹 Gera novas atividades via backend (n8n)
  ============================================================ */
  const generateActivities = useCallback(async (payload: any) => {
    try {
      setLoading(true);
      console.log("%c[useAiActivities]%c Enviando payload para geração de atividade...", styles.info, styles.dim);

      const activeUser = getActiveUser();
      if (!activeUser?.id || !activeUser?.nome) {
        console.error("%c⛔ Professor não carregado — abortando geração de atividade.", styles.error);
        return;
      }

      const fullPayload = {
        ...payload,
        professor: { id: activeUser.id, nome: activeUser.nome },
      };

      const res = await axios.post(`/api/ai/gerarAtividade`, fullPayload);
      const created = res?.data?.success ? res.data.data : res?.data;

      if (created && created._id) {
        setActivities((prev) => [created, ...(prev || [])]);
        console.log("%c✅ Nova atividade gerada e adicionada à lista.", styles.success);
      } else {
        console.warn("%c⚠️ Resposta inesperada ao gerar atividade:%c", styles.warn, styles.dim, res?.data);
      }
    } catch (error: any) {
      console.error("%c❌ Erro ao gerar atividades:%c %s", styles.error, styles.dim, error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============================================================
     🔹 Marca uma atividade como revisada
  ============================================================ */
  const markReviewed = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await axios.patch(`/api/ai/atividades/${id}/revisar`);
      const ok = res?.data?.success === true || (res?.status >= 200 && res?.status < 300);

      if (ok) {
        setActivities((prev) =>
          (prev || []).map((a) => (a._id === id ? { ...a, revisado: true, revisadoEm: new Date().toISOString() } : a))
        );
        console.log("%c📝 Atividade %s marcada como revisada.", styles.info, id);
      }
    } catch (error: any) {
      console.error("%c❌ Erro ao marcar atividade revisada:%c %s", styles.error, styles.dim, error?.message || error);
    }
  }, []);

  /* ============================================================
     🔹 Exclui uma atividade
  ============================================================ */
  const deleteActivity = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await axios.delete(`/api/ai/atividades/${id}`);
      const ok = res?.data?.success === true || (res?.status >= 200 && res?.status < 300);

      if (ok) {
        setActivities((prev) => (prev || []).filter((a) => a._id !== id));
        console.log("%c🗑️ Atividade %s excluída com sucesso.", styles.info, id);
      }
    } catch (error: any) {
      console.error("%c❌ Erro ao excluir atividade:%c %s", styles.error, styles.dim, error?.message || error);
    }
  }, []);

  /* ============================================================
     🔹 Valida uma atividade revisada
  ============================================================ */
  const validateActivity = useCallback(async (payload: any) => {
    if (!payload?.id) {
      console.warn("%c⚠️ Nenhum ID de atividade fornecido para validação.", styles.warn);
      return;
    }

    try {
      setLoading(true);
      console.log("%c[useAiActivities]%c Validando atividade %s...", styles.info, styles.dim, payload.id);

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
        console.log("%c✅ Atividade %s validada com sucesso.", styles.success, payload.id);
      }
    } catch (error: any) {
      console.error("%c❌ Erro ao validar atividade:%c %s", styles.error, styles.dim, error?.message || error);
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
