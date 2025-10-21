// server/services/aiFeedbackService.ts
import axios from "axios";
import { AtividadeGerada } from "../models/AtividadeGerada.js";
import { ValidacaoPedagogica } from "../models/ValidacaoPedagogica.js";

/* ============================================================
   🔹 1. ENVIO DE FEEDBACK AO N8N (fine-tuning adaptativo)
   ============================================================ */
export const enviarFeedbackParaN8n = async (feedback: any) => {
  try {
    const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL;
    if (!webhookUrl) throw new Error("N8N_FEEDBACK_WEBHOOK_URL não configurada.");

    const response = await axios.post(webhookUrl, feedback, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Falha ao enviar feedback ao n8n:", error.message);
    return null;
  }
};

/* ============================================================
   🔹 2. VALIDAÇÃO PEDAGÓGICA — PROFESSOR REVISANDO ATIVIDADE
   ============================================================ */
export const validarAtividade = async (payload: {
  id: string;
  explicacaoAtualizada: string;
  feedbackProfessor?: string;
  qualidadeIA: number;
  comentario: string;
  professor: { id: string; nome: string };
  disciplina: { id: string; nome: string };
}) => {
  try {
    const { id, explicacaoAtualizada, feedbackProfessor, qualidadeIA, comentario, professor, disciplina } = payload;

    // ✅ Atualiza a atividade com as revisões do professor
    const atividade = await AtividadeGerada.findByIdAndUpdate(
      id,
      {
        validado: true,
        explicacaoAtualizada,
        feedbackProfessor,
        validadoEm: new Date(),
      },
      { new: true }
    );

    if (!atividade) {
      throw new Error("Atividade não encontrada.");
    }

    // ✅ Atualiza ou cria registro de validação pedagógica
    await ValidacaoPedagogica.findOneAndUpdate(
      {
        professorId: professor.id,
        disciplinaId: disciplina.id,
      },
      {
        $set: {
          nomeProfessor: professor.nome,
          nomeDisciplina: disciplina.nome,
          ultimaValidacao: new Date(),
        },
        $inc: { atividadesValidadas: 1 },
        $push: {
          feedbacks: {
            atividadeId: atividade._id,
            comentario,
            qualidadeIA,
          },
        },
      },
      { upsert: true, new: true }
    );

    // ✅ Envia feedback detalhado ao agente n8n
    await enviarFeedbackParaN8n({
      professor,
      disciplina,
      atividadeId: id,
      explicacaoAnterior: atividade.explicacaoAnterior ?? "",
      explicacaoNova: explicacaoAtualizada,
      avaliacaoProfessor: {
        qualidade: qualidadeIA,
        comentario,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Atividade validada e feedback enviado com sucesso.",
      data: atividade,
    };
  } catch (error: any) {
    console.error("❌ Erro ao validar atividade:", error.message);
    throw new Error("Erro interno ao validar atividade e enviar feedback.");
  }
};
