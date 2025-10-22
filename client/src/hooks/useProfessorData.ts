// client/src/hooks/useProfessorData.ts
import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Hook para buscar disciplinas e turmas associadas ao professor autenticado.
 * Compatível com o backend atual (rota: /api/professor/disciplinas)
 */
export const useProfessorData = () => {
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 🔹 Busca disciplinas e turmas do professor autenticado
   * Ajustado para backend que usa req.user (sem :id na rota)
   */
  const fetchDisciplinasETurmas = useCallback(async () => {
    try {
      console.log("[useProfessorData] Fetching professor disciplines...");
      setLoading(true);

      // ✅ Ajuste principal — rota sem :id
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
        console.log(`[useProfessorData] Disciplinas carregadas: ${disciplinas.length}`);
      } else {
        console.warn("[useProfessorData] Nenhuma disciplina encontrada para este professor.");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar disciplinas/turmas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { disciplinas, turmas, loading, fetchDisciplinasETurmas };
};
