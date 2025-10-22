//client/src/components/AiActivityModal.tsx
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

interface AiActivityModalProps {
  open: boolean;
  onClose: () => void;
}

export const AiActivityModal: React.FC<AiActivityModalProps> = ({ open, onClose }) => {
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

  useEffect(() => {
    // busca automática das disciplinas e turmas do professor logado
    fetchDisciplinasETurmas();
  }, [fetchDisciplinasETurmas]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>✨ Gerar Nova Atividade por IA</DialogTitle>
        </DialogHeader>

        {/* Formulário */}
        <div className="space-y-4 py-2">
          <div>
            <Label>Disciplina</Label>
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
          </div>

          <div>
            <Label>Turma</Label>
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
          </div>

          <div>
            <Label>Tema / Conteúdo</Label>
            <Input
              value={formData.tema}
              onChange={(e) => handleChange("tema", e.target.value)}
              placeholder="Ex: Segunda Lei de Newton"
            />
          </div>

          <div>
            <Label>Objetivo Pedagógico (opcional)</Label>
            <Input
              value={formData.objetivo}
              onChange={(e) => handleChange("objetivo", e.target.value)}
              placeholder="Ex: Aplicar conceitos de força e movimento"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo de Atividade</Label>
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
              <Label>Nível de Dificuldade</Label>
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
            <Label>Quantidade de Questões</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={formData.quantidade}
              onChange={(e) => handleChange("quantidade", Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Gerando..." : "Gerar Atividade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
