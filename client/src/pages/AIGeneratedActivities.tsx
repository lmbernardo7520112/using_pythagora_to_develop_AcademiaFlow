//client/src/pages/AiGeneratedActivities.tsx

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileDown, Edit3 } from "lucide-react";
import { AiActivityPreview } from "@/components/ai/AiActivityPreview";
import { useAiActivities } from "@/hooks/useAiActivities";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * 📘 Página que exibe uma atividade completa gerada pela IA.
 * Permite visualização, revisão e exportação da atividade.
 * ✅ Estável, sincronizada e com logs coloridos.
 */
export default function AIGeneratedActivities() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, fetchActivities, validateActivity, loading } = useAiActivities();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Estados de revisão
  const [modalOpen, setModalOpen] = useState(false);
  const [explicacaoAtualizada, setExplicacaoAtualizada] = useState("");
  const [feedbackProfessor, setFeedbackProfessor] = useState("");
  const [qualidadeIA, setQualidadeIA] = useState(8);
  const [comentario, setComentario] = useState("");

  const pdfRef = useRef<HTMLDivElement>(null);

  /** 🎨 Estilos de logs coloridos */
  const styles = {
    info: "color:#00a8ff;font-weight:bold",
    success: "color:#4cd137;font-weight:bold",
    warn: "color:#e1b12c;font-weight:bold",
    error: "color:#e84118;font-weight:bold",
    dim: "color:gray;font-weight:normal",
  };

  /**
   * 🧩 Etapa 1 — Busca inicial das atividades do professor
   */
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("%c[AIGeneratedActivities] Nenhum userId no localStorage.", styles.warn);
      return;
    }

    if (activities.length === 0) {
      console.log("%c[AIGeneratedActivities] Nenhuma atividade local — buscando servidor...", styles.info);
      fetchActivities(userId);
    } else {
      console.log("%c[AIGeneratedActivities] Cache detectado — usando atividades locais.", styles.dim);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities.length]);

  /**
   * 🧩 Etapa 2 — Seleciona a atividade correta após carregamento
   */
  useEffect(() => {
    if (loading) {
      console.log("%c[AIGeneratedActivities] Carregando atividades...", styles.dim);
      return;
    }

    if (!loading && activities.length && id) {
      const found = activities.find((a) => a._id === id);
      if (found) {
        console.log("%c✅ Atividade encontrada:", styles.success, found._id);
        setSelectedActivity(found);
      } else {
        console.warn(`%c⚠️ Nenhuma atividade encontrada para o ID ${id}`, styles.warn);
        console.log("%c[DEBUG] Atividades disponíveis:", styles.dim, activities);
      }
    }
  }, [activities, id, loading]);

  /**
   * 📄 Exporta o conteúdo para PDF
   */
  const handleExportPDF = async () => {
    if (!pdfRef.current || !selectedActivity) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`atividade_${selectedActivity?.metadata?.tema || "IA"}.pdf`);
  };

  /** ✏️ Abre modal de revisão */
  const handleOpenReview = () => {
    if (!selectedActivity) return;
    setExplicacaoAtualizada(selectedActivity?.atividades?.[0]?.explicacao ?? "");
    setModalOpen(true);
  };

  /** ✅ Envia revisão ao backend */
  const handleValidate = async () => {
    if (!selectedActivity) return;
    console.log("%c[Feedback] Enviando revisão ao backend...", styles.info);

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

    console.log("%c[Feedback] Revisão enviada com sucesso!", styles.success);
    setModalOpen(false);
  };

  // ============================
  // 🔄  Renderizações condicionais
  // ============================

  /** 🌀 Loader durante carregamento */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <Loader2 className="animate-spin h-6 w-6 mb-3 text-blue-500" />
        <p>Carregando atividades...</p>
      </div>
    );
  }

  /** 🚫 Fallback: nenhuma atividade no backend */
  if (!loading && activities.length === 0) {
    console.warn("%c[AIGeneratedActivities] Nenhuma atividade no backend.", styles.warn);
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <h2 className="text-xl font-semibold mb-2">Nenhuma atividade encontrada</h2>
        <p className="text-gray-500 mb-4">
          Nenhum registro foi retornado para este professor.
        </p>
        <Button variant="default" onClick={() => navigate("/professor/ai-atividades")}>
          Voltar à lista
        </Button>
      </div>
    );
  }

  /** ⚠️ Fallback: atividades existem, mas ID não corresponde */
  if (!loading && activities.length > 0 && !selectedActivity) {
    console.warn("%c[AIGeneratedActivities] ID não corresponde a nenhuma atividade.", styles.warn);
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Nenhuma atividade correspondente encontrada
        </h2>
        <p className="text-gray-500 mb-6">
          Verifique o link ou volte à lista de atividades.
        </p>
        <Button variant="default" onClick={() => navigate("/professor/ai-atividades")}>
          Voltar à lista
        </Button>
      </div>
    );
  }

  // ============================
  // ✅ Renderização principal
  // ============================

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

      {/* Corpo */}
      <div ref={pdfRef} className="bg-white rounded-lg shadow p-4">
        {selectedActivity.atividades?.map((atividade: any, index: number) => (
          <AiActivityPreview key={index} atividade={atividade} />
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
