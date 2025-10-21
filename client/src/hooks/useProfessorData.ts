import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Hook para buscar disciplinas e turmas associadas ao professor autenticado.
 * Reaproveita o endpoint do professorService no backend.
 */
export const useProfessorData = () => {
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 🔹 Busca disciplinas e turmas do professor autenticado
   */
  const fetchDisciplinasETurmas = useCallback(async (professorId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/professores/${professorId}/disciplinas`);
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
      }
    } catch (error) {
      console.error("❌ Erro ao buscar disciplinas/turmas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { disciplinas, turmas, loading, fetchDisciplinasETurmas };
};
