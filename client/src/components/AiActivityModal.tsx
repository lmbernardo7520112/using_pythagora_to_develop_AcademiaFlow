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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAiActivities } from "@/hooks/useAiActivities";
import { useProfessorData } from "@/hooks/useProfessorData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import axios from "axios";

interface AiActivityModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "review"; // novo modo
  atividadeSelecionada?: any; // usada quando coordenação abre para revisar
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

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Fluxo de professor (gerar atividade)
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

  // Fluxo de coordenação (validação)
  const handleValidation = async (validado: boolean) => {
    if (!atividadeSelecionada?._id) return;

    try {
      setSubmitting(true);
      await axios.patch(`/api/coord/atividades/${atividadeSelecionada._id}/validar`, {
        feedback,
        validado,
      });

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
          {/* Campos compartilhados */}
          <div>
            <Label>Disciplina</Label>
            {mode === "create" ? (
              <Select
                value={formData.disciplinaId}
                onValueChange={(value) => handleChange("disciplinaId", value)}
              >
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
              <Select
                value={formData.turmaId}
                onValueChange={(value) => handleChange("turmaId", value)}
              >
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

          {mode === "create" && (
            <>
              <div>
                <Label>Objetivo Pedagógico (opcional)</Label>
                <Input
                  value={formData.objetivo}
                  onChange={(e) => handleChange("objetivo", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleChange("tipo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="múltipla escolha">Múltipla escolha</SelectItem>
                      <SelectItem value="dissertativa">Dissertativa</SelectItem>
                      <SelectItem value="verdadeiro/falso">Verdadeiro ou falso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dificuldade</Label>
                  <Select
                    value={formData.dificuldade}
                    onValueChange={(value) => handleChange("dificuldade", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fácil">Fácil</SelectItem>
                      <SelectItem value="médio">Médio</SelectItem>
                      <SelectItem value="difícil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.quantidade}
                  onChange={(e) => handleChange("quantidade", Number(e.target.value))}
                />
              </div>
            </>
          )}

          {/* Modo coordenação */}
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
              <Button
                variant="secondary"
                onClick={() => handleValidation(false)}
                disabled={submitting}
              >
                Rejeitar
              </Button>
              <Button
                variant="default"
                onClick={() => handleValidation(true)}
                disabled={submitting}
              >
                Validar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
