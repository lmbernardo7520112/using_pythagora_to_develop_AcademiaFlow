// client/src/hooks/useProfessorData.ts

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook para buscar disciplinas e turmas associadas ao professor autenticado.
 * ✅ Reativo com AuthContext e fallback via localStorage.
 */
export const useProfessorData = () => {
  const { user, loading: authLoading } = useAuth();
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const styles = {
    info: "color:#00bcd4;font-weight:bold",
    success: "color:#4caf50;font-weight:bold",
    warn: "color:#ff9800;font-weight:bold",
    error: "color:#f44336;font-weight:bold",
    dim: "color:gray",
  };

  /**
   * 🔹 Busca disciplinas e turmas do professor autenticado
   */
  const fetchDisciplinasETurmas = useCallback(async () => {
    try {
      console.log("%c[useProfessorData]%c Fetching professor disciplines...", styles.info, styles.dim);
      setLoading(true);

      const res = await axios.get(`/api/professor/disciplinas`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const disciplinas = res.data.data;

        // Extrai turmas únicas associadas às disciplinas
        const turmasUnicas = new Map<string, any>();
        disciplinas.forEach((disc: any) => {
          (disc.turmas || []).forEach((turma: any) => {
            if (!turmasUnicas.has(turma._id)) {
              turmasUnicas.set(turma._id, turma);
            }
          });
        });

        setDisciplinas(disciplinas);
        setTurmas(Array.from(turmasUnicas.values()));

        console.log("%c[useProfessorData]%c Disciplinas carregadas:", styles.success, styles.dim, disciplinas.length);
      } else {
        console.warn("%c[useProfessorData]%c Nenhuma disciplina encontrada.", styles.warn, styles.dim);
      }
    } catch (error: any) {
      console.error("%c❌ Erro ao buscar disciplinas/turmas:%c", styles.error, styles.dim, error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔁 Sincronização reativa com AuthContext e fallback localStorage
   */
  useEffect(() => {
    if (authLoading) return;

    const storedUser = localStorage.getItem("userData");
    const activeUser = user?._id ? user : storedUser ? JSON.parse(storedUser) : null;

    if (activeUser?._id && !hasFetched.current) {
      hasFetched.current = true;
      fetchDisciplinasETurmas();
    }
  }, [authLoading, user?._id, fetchDisciplinasETurmas]);

  return { disciplinas, turmas, loading, fetchDisciplinasETurmas };
};
