// client/src/pages/professor/AiActivitiesDashboard.tsx


import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAiActivities } from "@/hooks/useAiActivities";
import { useProfessorData } from "@/hooks/useProfessorData";
import { AiActivityList } from "@/components/ai/AiActivityList";
import { AiActivityProgressChart } from "@/components/ai/AiActivityProgressChart";
import { ActivityFilters } from "@/components/ai/ActivityFilters";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";

export function AiActivitiesDashboard() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { activities, loading, fetchActivities, generateActivities } = useAiActivities();
  const { disciplinas, turmas, fetchDisciplinasETurmas } = useProfessorData();

  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [tema, setTema] = useState("");
  const [tipoAtividade, setTipoAtividade] = useState("múltipla escolha");
  const [nivelDificuldade, setNivelDificuldade] = useState("intermediário");
  const [quantidade, setQuantidade] = useState(2);

  /* ============================================================
     🔁 Sincronização segura de dados do professor
  ============================================================ */
  const safeFetchAll = useCallback(async () => {
    try {
      if (!user?._id) return;
      console.log("📡 Atualizando dados de AI Activities para:", user.nome);

      // 🔄 Atualiza tanto disciplinas quanto atividades
      await Promise.all([fetchDisciplinasETurmas(), fetchActivities(user._id)]);
    } catch (err) {
      console.error("❌ Erro ao atualizar dados:", err);
    }
  }, [user, fetchDisciplinasETurmas, fetchActivities]);

  useEffect(() => {
    if (!authLoading && user?._id) {
      safeFetchAll();
    }
  }, [user, authLoading, safeFetchAll]);

  /* ============================================================
     🧠 Geração de novas atividades
  ============================================================ */
  const handleGenerate = async () => {
    if (authLoading) {
      toast({
        title: "Aguarde o carregamento",
        description: "O perfil ainda está sendo restaurado.",
      });
      return;
    }

    if (!user?._id) {
      toast({
        title: "Usuário não autenticado",
        description: "Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDisciplina || !selectedTurma) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione a disciplina e a turma antes de gerar a atividade.",
      });
      return;
    }

    const disciplina = disciplinas.find((d) => d._id === selectedDisciplina);
    const turma = turmas.find((t) => t._id === selectedTurma);
    const nome = user.nome || user.email?.split("@")[0] || "Professor";

    const payload = {
      professor: { id: user._id, nome },
      disciplina: { id: disciplina?._id, nome: disciplina?.nome },
      turma: { id: turma?._id, nome: turma?.nome },
      conteudo: {
        tema: tema || disciplina?.nome || "Tema Geral",
        subtopicos: ["Conceitos Fundamentais"],
        objetivos_aprendizagem: [
          "Gerar atividades que estimulem o raciocínio e a compreensão conceitual.",
        ],
      },
      tipo_atividade: tipoAtividade,
      nivel_dificuldade: nivelDificuldade,
      quantidade,
    };

    console.info("🚀 Enviando payload seguro para geração de atividade:", payload);

    try {
      await generateActivities(payload);
      setGenerateModalOpen(false);
      await fetchActivities(user._id); // 🔁 Atualiza lista imediatamente
      toast({
        title: "Atividade gerada com sucesso!",
        description: "As novas atividades foram adicionadas à sua lista.",
      });
    } catch (error: any) {
      console.error("❌ Erro ao gerar atividade:", error);
      toast({
        title: "Erro ao gerar atividade",
        description:
          error?.message || "Não foi possível gerar novas atividades. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  /* ============================================================
     🎯 Filtro e consistência com Coordenação
     - Mostra separadamente atividades pendentes e validadas
     - Garante sincronia entre dashboards
  ============================================================ */
  const atividadesPendentes = Array.isArray(activities)
    ? activities.filter((a) => !a.validado)
    : [];

  const atividadesValidadas = Array.isArray(activities)
    ? activities.filter((a) => a.validado)
    : [];

  const noActivities = !loading && atividadesPendentes.length === 0;

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Atividades Geradas por IA</h1>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <Select value={selectedDisciplina} onValueChange={setSelectedDisciplina}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione disciplina" />
            </SelectTrigger>
            <SelectContent>
              {disciplinas.map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTurma} onValueChange={setSelectedTurma}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione turma" />
            </SelectTrigger>
            <SelectContent>
              {turmas.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setGenerateModalOpen(true)}
            disabled={loading || !selectedDisciplina || !selectedTurma}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Atividade
          </Button>
        </div>
      </div>

      {/* Filtros e gráficos */}
      <ActivityFilters professorId={user?._id || ""} onFilterChange={() => {}} />
      <AiActivityProgressChart activities={activities} />

      {/* 🔹 Pendentes de validação */}
      <section className="mt-4">
        <h2 className="text-lg font-semibold mb-2 text-yellow-700">
          Atividades Pendentes de Validação
        </h2>
        {noActivities ? (
          <div className="p-4 text-center text-muted-foreground border rounded-md">
            Nenhuma atividade pendente no momento.
          </div>
        ) : (
          <AiActivityList activities={atividadesPendentes} onReview={() => {}} />
        )}
      </section>

      {/* 🔹 Já validadas pela coordenação */}
      {atividadesValidadas.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2 text-green-700">
            Atividades Validadas pela Coordenação
          </h2>
          <AiActivityList activities={atividadesValidadas} onReview={() => {}} />
        </section>
      )}

      {/* Modal de geração */}
      <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerar Nova Atividade</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Tema</Label>
            <Input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Digite o tema"
            />

            <Label>Tipo</Label>
            <Select value={tipoAtividade} onValueChange={setTipoAtividade}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                <SelectItem value="dissertativa">Dissertativa</SelectItem>
                <SelectItem value="desafio prático">Desafio Prático</SelectItem>
              </SelectContent>
            </Select>

            <Label>Nível</Label>
            <Select value={nivelDificuldade} onValueChange={setNivelDificuldade}>
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="básico">Básico</SelectItem>
                <SelectItem value="intermediário">Intermediário</SelectItem>
                <SelectItem value="avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>

            <Label>Quantidade</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setGenerateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={loading || authLoading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Gerando...
                </>
              ) : (
                "Gerar Atividade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
