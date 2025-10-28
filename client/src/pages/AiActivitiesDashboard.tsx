// client/src/pages/professor/AiActivitiesDashboard.tsx

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAiActivities } from "@/hooks/useAiActivities";
import { useProfessorData } from "@/hooks/useProfessorData";
import { AiActivityList } from "@/components/ai/AiActivityList";
import { AiActivityProgressChart } from "@/components/ai/AiActivityProgressChart";
import { ActivityFilters } from "@/components/ai/ActivityFilters";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  useEffect(() => {
    if (!authLoading && user?._id) {
      fetchDisciplinasETurmas();
      fetchActivities(user._id);
    }
  }, [user, authLoading, fetchActivities, fetchDisciplinasETurmas]);

  const handleGenerate = async () => {
    if (authLoading) {
      toast({
        title: "Aguarde o carregamento",
        description: "O perfil ainda está sendo restaurado.",
        variant: "default",
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
        variant: "default",
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

    await generateActivities(payload);
    setGenerateModalOpen(false);
    fetchActivities(user._id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Atividades Geradas por IA</h1>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <Select value={selectedDisciplina} onValueChange={setSelectedDisciplina}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Selecione disciplina" /></SelectTrigger>
            <SelectContent>{disciplinas.map((d) => <SelectItem key={d._id} value={d._id}>{d.nome}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedTurma} onValueChange={setSelectedTurma}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Selecione turma" /></SelectTrigger>
            <SelectContent>{turmas.map((t) => <SelectItem key={t._id} value={t._id}>{t.nome}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => setGenerateModalOpen(true)} disabled={loading || !selectedDisciplina || !selectedTurma}>
            <Plus className="mr-2 h-4 w-4" /> Nova Atividade
          </Button>
        </div>
      </div>

      <ActivityFilters professorId={user?._id || ""} onFilterChange={() => {}} />
      <AiActivityProgressChart activities={activities} />
      <AiActivityList activities={activities} onReview={() => {}} />

      <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Gerar Nova Atividade</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Tema</Label>
            <Input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Digite o tema" />
            <Label>Tipo</Label>
            <Select value={tipoAtividade} onValueChange={setTipoAtividade}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                <SelectItem value="dissertativa">Dissertativa</SelectItem>
                <SelectItem value="desafio prático">Desafio Prático</SelectItem>
              </SelectContent>
            </Select>
            <Label>Nível</Label>
            <Select value={nivelDificuldade} onValueChange={setNivelDificuldade}>
              <SelectTrigger><SelectValue placeholder="Nível" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="básico">Básico</SelectItem>
                <SelectItem value="intermediário">Intermediário</SelectItem>
                <SelectItem value="avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
            <Label>Quantidade</Label>
            <Input type="number" min={1} max={10} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setGenerateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleGenerate} disabled={loading || authLoading}>
              {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Gerando...</> : "Gerar Atividade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
