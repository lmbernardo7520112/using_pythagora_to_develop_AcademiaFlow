import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAiActivities } from "@/hooks/useAiActivities";
import { useProfessorData } from "@/hooks/useProfessorData";
import { ActivityFilters } from "@/components/ai/ActivityFilters";
import { AiActivityList } from "@/components/ai/AiActivityList";
import { AiActivityProgressChart } from "@/components/ai/AiActivityProgressChart";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AiActivitiesDashboard() {
  const { user } = useAuth();
  const { activities, loading, fetchActivities, generateActivities, validateActivity } =
    useAiActivities();
  const { disciplinas, turmas, fetchDisciplinasETurmas } = useProfessorData();

  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [explicacaoAtualizada, setExplicacaoAtualizada] = useState("");
  const [feedbackProfessor, setFeedbackProfessor] = useState("");
  const [qualidadeIA, setQualidadeIA] = useState(8);
  const [comentario, setComentario] = useState("");
  const [filters, setFilters] = useState<{
    disciplinaId?: string;
    turmaId?: string;
    status?: "pendente" | "revisada" | "todas";
  }>({ status: "todas" });

  // 🔹 Buscar disciplinas, turmas e atividades
  useEffect(() => {
    if (user?._id) {
      fetchDisciplinasETurmas(user._id);
      fetchActivities(user._id);
    }
  }, [user, fetchActivities, fetchDisciplinasETurmas]);

  // 🔹 Aplicar filtros dinamicamente
  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    return activities.filter((a) => {
      const matchDisciplina = filters.disciplinaId
        ? a.disciplinaId === filters.disciplinaId
        : true;
      const matchTurma = filters.turmaId ? a.turmaId === filters.turmaId : true;
      const matchStatus =
        filters.status === "pendente"
          ? !a.validado && !a.revisado
          : filters.status === "revisada"
          ? a.validado || a.revisado
          : true;
      return matchDisciplina && matchTurma && matchStatus;
    });
  }, [activities, filters]);

  // 🔹 Geração de novas atividades via IA
  const handleGenerate = async () => {
    if (!user || !selectedDisciplina || !selectedTurma) return;

    const disciplina = disciplinas.find((d) => d._id === selectedDisciplina);
    const turma = turmas.find((t) => t._id === selectedTurma);

    const payload = {
      professor: { id: user._id, nome: user.nome },
      disciplina: { id: disciplina?._id, nome: disciplina?.nome },
      turma: { id: turma?._id, nome: turma?.nome },
      conteudo: {
        tema: disciplina?.nome || "Tema Geral",
        subtopicos: ["Conceitos Fundamentais"],
        objetivos_aprendizagem:
          "Gerar atividades que estimulem o raciocínio e a compreensão conceitual.",
      },
      tipo_atividade: "múltipla escolha",
      nivel_dificuldade: "intermediário",
      quantidade: 2,
    };

    await generateActivities(payload);
  };

  // 🔹 Abertura do modal de revisão
  const handleOpenReview = (activity: any) => {
    setSelectedActivity(activity);
    setExplicacaoAtualizada(activity.atividades?.[0]?.explicacao ?? "");
    setModalOpen(true);
  };

  // 🔹 Envio de feedback e validação
  const handleValidate = async () => {
    if (!user || !selectedActivity) return;

    await validateActivity({
      id: selectedActivity._id,
      explicacaoAtualizada,
      feedbackProfessor,
      qualidadeIA,
      comentario,
      professor: { id: user._id, nome: user.nome },
      disciplina: {
        id: selectedActivity.disciplinaId,
        nome: selectedActivity.metadata?.disciplina ?? "Disciplina",
      },
    });

    setModalOpen(false);
    fetchActivities(user._id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Cabeçalho */}
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
            onClick={handleGenerate}
            disabled={loading || !selectedDisciplina || !selectedTurma}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Gerando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Nova Atividade
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 🔹 Filtros de atividade */}
      {user && (
        <ActivityFilters
          professorId={user._id}
          loading={loading}
          onFilterChange={setFilters}
        />
      )}

      {/* 🔹 Gráfico analítico de progresso */}
      <AiActivityProgressChart activities={filteredActivities} />

      {/* 🔹 Lista de atividades filtradas */}
      <AiActivityList activities={filteredActivities} onReview={handleOpenReview} />

      {/* 🔹 Modal de revisão pedagógica */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisão da Atividade</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Explicação Atualizada</Label>
            <Textarea
              value={explicacaoAtualizada}
              onChange={(e) => setExplicacaoAtualizada(e.target.value)}
              rows={5}
            />

            <Label>Feedback do Professor</Label>
            <Textarea
              value={feedbackProfessor}
              onChange={(e) => setFeedbackProfessor(e.target.value)}
              rows={3}
              placeholder="Observações gerais sobre a qualidade da atividade..."
            />

            <Label>Qualidade da IA (0 a 10)</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={qualidadeIA}
              onChange={(e) => setQualidadeIA(Number(e.target.value))}
            />

            <Label>Comentário para o sistema</Label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Sugestões para melhorar a geração de atividades..."
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleValidate}>Enviar Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
