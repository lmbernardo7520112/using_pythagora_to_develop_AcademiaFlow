//client/src/context/AiActivitiesContext.tsx


import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/useToast";
import { gerarAtividades, listarAtividades, revisarAtividade, excluirAtividade } from "@/api/aiActivities";

interface AiActivitiesContextType {
  activities: any[];
  loading: boolean;
  generateActivities: (payload: any) => Promise<void>;
  fetchActivities: (professorId: string) => Promise<void>;
  markReviewed: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

const AiActivitiesContext = createContext<AiActivitiesContextType | undefined>(undefined);

export function AiActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateActivities = useCallback(async (payload: any) => {
    try {
      setLoading(true);
      const response = await gerarAtividades(payload);
      setActivities(prev => [response.data, ...prev]);
      toast({ title: "Atividades geradas com sucesso ✅" });
    } catch (error: any) {
      console.error("Erro ao gerar atividades:", error);
      toast({ title: "Erro ao gerar atividades", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivities = useCallback(async (professorId: string) => {
    try {
      setLoading(true);
      const data = await listarAtividades(professorId);
      setActivities(data);
    } catch (error) {
      console.error("Erro ao listar atividades:", error);
      toast({ title: "Erro ao carregar atividades", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const markReviewed = useCallback(async (id: string) => {
    try {
      await revisarAtividade(id);
      setActivities(prev => prev.map(a => (a._id === id ? { ...a, revisado: true } : a)));
      toast({ title: "Atividade marcada como revisada" });
    } catch {
      toast({ title: "Erro ao revisar atividade", variant: "destructive" });
    }
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    try {
      await excluirAtividade(id);
      setActivities(prev => prev.filter(a => a._id !== id));
      toast({ title: "Atividade excluída com sucesso" });
    } catch {
      toast({ title: "Erro ao excluir atividade", variant: "destructive" });
    }
  }, []);

  return (
    <AiActivitiesContext.Provider
      value={{ activities, loading, generateActivities, fetchActivities, markReviewed, deleteActivity }}
    >
      {children}
    </AiActivitiesContext.Provider>
  );
}

export const useAiActivitiesContext = () => {
  const context = useContext(AiActivitiesContext);
  if (!context)
    throw new Error("useAiActivitiesContext deve ser usado dentro de AiActivitiesProvider");
  return context;
};
