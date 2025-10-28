//client/src/hooks/useAiActivities.ts

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

export const useAiActivities = () => {
  const { user, loading: authLoading } = useAuth();
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

  const getActiveUser = (): { id?: string; nome?: string } | null => {
    if (user?._id) {
      const nomeDerivado = user.nome || (typeof user.email === "string" ? user.email.split("@")[0] : "Professor");
      return { id: user._id, nome: nomeDerivado };
    }

    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?._id) {
          const nomeDerivado = parsed.nome || (typeof parsed.email === "string" ? parsed.email.split("@")[0] : "Professor");
          return { id: parsed._id, nome: nomeDerivado };
        }
      }
    } catch (err) {
      console.error("%c[useAiActivities]%c Falha ao recuperar user do localStorage:", styles.error, styles.dim, err);
    }
    return null;
  };

  const normalizeActivitiesResponse = (res: any): any[] => {
    if (Array.isArray(res?.data)) return res.data;
    if (res?.data?.success && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    console.warn("%c[useAiActivities]%c Resposta inesperada do backend:", styles.warn, styles.dim, res?.data);
    return [];
  };

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

  useEffect(() => {
    if (authLoading) return;
    const activeUser = getActiveUser();
    if (activeUser?.id && !lastFetchedId.current) fetchActivities(activeUser.id);
  }, [authLoading, user?._id, fetchActivities]);

  const generateActivities = useCallback(async (payload: any) => {
    try {
      setLoading(true);
      console.log("%c[useAiActivities]%c Enviando payload para geração de atividade...", styles.info, styles.dim);
      const activeUser = getActiveUser();
      if (!activeUser?.id || !activeUser?.nome) {
        console.error("%c⛔ Professor não carregado — abortando geração de atividade.", styles.error);
        return;
      }
      const fullPayload = { ...payload, professor: { id: activeUser.id, nome: activeUser.nome } };
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

  return { activities, loading, generateActivities, fetchActivities };
};
