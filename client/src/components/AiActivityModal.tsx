//client/src/components/AiActivityModal.tsx

// client/src/components/AiActivityModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAiActivities } from "@/hooks/useAiActivities";
import { useProfessorData } from "@/hooks/useProfessorData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { validateActivity } from "@/api/coord";

interface AiActivityModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "review";
  atividadeSelecionada?: any;
}

export const AiActivityModal: React.FC<AiActivityModalProps> = ({
  open,
  onClose,
  mode = "create",
  atividadeSelecionada,
}) => {
  const { currentUser } = useAuth();
  const { disciplinas, turmas, fetchDisciplinasETurmas } = useProfessorData();
  const { generateActivities, loading } = useAiActivities();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    disciplinaId: "",
    turmaId: "",
    tema: "",
    tipo: "múltipla escolha",
    dificuldade: "médio",
    quantidade: 5,
    objetivo: "",
  });

  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDisciplinasETurmas();
    if (mode === "review" && atividadeSelecionada) {
      setFormData({
        disciplinaId: atividadeSelecionada.disciplinaId?._id || "",
        turmaId: atividadeSelecionada.turmaId?._id || "",
        tema: atividadeSelecionada.metadata?.tema || "",
        tipo: atividadeSelecionada.atividades?.[0]?.tipo || "múltipla escolha",
        dificuldade: atividadeSelecionada.atividades?.[0]?.nivel_dificuldade || "médio",
        quantidade: atividadeSelecionada.atividades?.length || 1,
        objetivo: atividadeSelecionada.metadata?.objetivo || "",
      });
    }
  }, [fetchDisciplinasETurmas, mode, atividadeSelecionada]);

  const handleChange = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // ✅ Fluxo de professor
  const handleSubmit = async () => {
    if (!formData.disciplinaId || !formData.turmaId || !formData.tema) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    const payload = {
      professor: { id: currentUser?._id, nome: currentUser?.nome },
      disciplina: { id: formData.disciplinaId },
      turma: { id: formData.turmaId },
      conteudo: {
        tema: formData.tema,
        objetivos_aprendizagem: formData.objetivo || "Explorar tema pedagógico proposto.",
      },
      tipo_atividade: formData.tipo,
      nivel_dificuldade: formData.dificuldade,
      quantidade: formData.quantidade,
    };
    await generateActivities(payload);
    onClose();
  };

  // ✅ Fluxo da coordenação (validação)
  const handleValidation = async (validado: boolean) => {
    if (!atividadeSelecionada?._id) return;
    try {
      setSubmitting(true);
      await validateActivity(atividadeSelecionada._id, { feedback, validado });
      toast({
        title: validado ? "Atividade validada com sucesso!" : "Atividade marcada como pendente.",
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao validar atividade", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "✨ Gerar Nova Atividade por IA" : "🔍 Revisar Atividade Pedagógica"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Disciplina</Label>
            {mode === "create" ? (
              <Select value={formData.disciplinaId} onValueChange={(v) => handleChange("disciplinaId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={atividadeSelecionada?.metadata?.disciplina || ""} disabled />
            )}
          </div>

          <div>
            <Label>Turma</Label>
            {mode === "create" ? (
              <Select value={formData.turmaId} onValueChange={(v) => handleChange("turmaId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={atividadeSelecionada?.turmaId?.nome || ""} disabled />
            )}
          </div>

          <div>
            <Label>Tema</Label>
            <Input
              value={formData.tema}
              disabled={mode === "review"}
              onChange={(e) => handleChange("tema", e.target.value)}
            />
          </div>

          {mode === "review" && (
            <div className="space-y-2">
              <Label>Feedback Pedagógico</Label>
              <Input
                placeholder="Ex: Revisar clareza do enunciado da questão 2"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {mode === "create" ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Gerando..." : "Gerar Atividade"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button variant="secondary" onClick={() => handleValidation(false)} disabled={submitting}>
                Rejeitar
              </Button>
              <Button variant="default" onClick={() => handleValidation(true)} disabled={submitting}>
                Validar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
