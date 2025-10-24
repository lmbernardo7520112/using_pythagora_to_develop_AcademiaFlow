// client/src/pages/AIGeneratedActivities.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileDown, Edit3 } from "lucide-react";
import { AiActivityPreview } from "@/components/ai/AiActivityPreview";
import { useAiActivities } from "@/hooks/useAiActivities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * 📘 Página que exibe a atividade completa gerada pela IA.
 * Permite ao professor visualizar, revisar e exportar em PDF.
 */
export default function AIGeneratedActivities() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, fetchActivities, validateActivity, loading } = useAiActivities();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Modal de revisão
  const [modalOpen, setModalOpen] = useState(false);
  const [explicacaoAtualizada, setExplicacaoAtualizada] = useState("");
  const [feedbackProfessor, setFeedbackProfessor] = useState("");
  const [qualidadeIA, setQualidadeIA] = useState(8);
  const [comentario, setComentario] = useState("");

  const pdfRef = useRef<HTMLDivElement>(null);

  // Carrega as atividades e seleciona a correspondente ao ID
  useEffect(() => {
    const load = async () => {
      if (!activities.length) {
        // Garante que temos as atividades carregadas
        await fetchActivities(localStorage.getItem("userId") || "");
      }
      const found = activities.find((a) => a._id === id);
      setSelectedActivity(found);
    };
    load();
  }, [activities, id, fetchActivities]);

  // Exporta o conteúdo renderizado em PDF
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`atividade_${selectedActivity?.metadata?.tema || "IA"}.pdf`);
  };

  const handleOpenReview = () => {
    setExplicacaoAtualizada(selectedActivity?.atividades?.[0]?.explicacao ?? "");
    setModalOpen(true);
  };

  const handleValidate = async () => {
    await validateActivity({
      id: selectedActivity._id,
      explicacaoAtualizada,
      feedbackProfessor,
      qualidadeIA,
      comentario,
      professor: selectedActivity.professor,
      disciplina: {
        id: selectedActivity.disciplinaId,
        nome: selectedActivity.metadata?.disciplina ?? "Disciplina",
      },
    });
    setModalOpen(false);
  };

  if (loading || !selectedActivity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin mr-2 h-6 w-6" /> Carregando atividade...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold mt-2">
            {selectedActivity.metadata?.tema || "Atividade Gerada"}
          </h1>
          <p className="text-gray-500">
            {selectedActivity.metadata?.disciplina || "Disciplina não especificada"} —{" "}
            {new Date(selectedActivity.metadata?.timestamp).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
          <Button onClick={handleOpenReview}>
            <Edit3 className="mr-2 h-4 w-4" /> Revisar
          </Button>
        </div>
      </div>

      {/* Conteúdo da atividade */}
      <div ref={pdfRef} className="bg-white rounded-lg shadow p-4">
        {selectedActivity.atividades?.map((atividade: any, i: number) => (
          <AiActivityPreview key={i} atividade={atividade} />
        ))}
      </div>

      {/* Modal de revisão */}
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
              rows={4}
            />

            <Label>Feedback do Professor</Label>
            <Textarea
              value={feedbackProfessor}
              onChange={(e) => setFeedbackProfessor(e.target.value)}
              rows={3}
            />

            <Label>Qualidade da IA (0 a 10)</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={qualidadeIA}
              onChange={(e) => setQualidadeIA(Number(e.target.value))}
            />

            <Label>Comentário adicional</Label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleValidate}>Enviar Revisão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
