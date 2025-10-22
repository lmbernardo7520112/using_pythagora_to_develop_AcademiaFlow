// server/services/aiAtividadesService.ts

import axios from "axios";
import { AtividadeGerada } from "../models/AtividadeGerada.js";
import { ValidacaoPedagogica } from "../models/ValidacaoPedagogica.ts";
import { enviarFeedbackParaN8n } from "../services/aiFeedbackService.js";

/* ============================================================
   🔹 1. ENVIO AO N8N PARA GERAÇÃO DE ATIVIDADES
   ============================================================ */
export const enviarParaN8n = async (dados: any) => {
  try {
    const webhookUrl = process.env.N8N_AI_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("N8N_AI_WEBHOOK_URL não configurada no .env");
    }

    console.log("🚀 Enviando dados ao n8n...");
    const resposta = await axios.post(webhookUrl, dados, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });

    if (!resposta.data) {
      throw new Error("Resposta vazia do n8n.");
    }

    console.log("✅ Resposta recebida do n8n:", resposta.data);
    return resposta.data;
  } catch (error: any) {
    console.error("❌ Falha na comunicação com n8n:", error.message);
    throw new Error("Erro ao enviar dados para o n8n. Detalhes: " + error.message);
  }
};

/* ============================================================
   🔹 2. GERAÇÃO DE ATIVIDADE VIA IA
   ============================================================ */
export const gerarAtividade = async (dados: any) => {
  try {
    if (!dados.professor || !dados.disciplina || !dados.turma || !dados.conteudo) {
      throw new Error("Dados insuficientes para gerar atividades.");
    }

    console.log("🧠 Gerando atividade via IA para:", {
      professor: dados.professor?.nome,
      disciplina: dados.disciplina?.id,
      turma: dados.turma?.id,
      tema: dados.conteudo?.tema,
    });

    // 🔗 Envio ao fluxo n8n
    const respostaN8n = await enviarParaN8n(dados);

    if (!respostaN8n || !respostaN8n.atividades) {
      console.error("❌ Resposta inválida do n8n:", respostaN8n);
      throw new Error("Falha ao gerar atividades via IA.");
    }

    // 💾 Salvar no banco
    const novaAtividade = await AtividadeGerada.create({
      professorId: dados.professor.id,
      disciplinaId: dados.disciplina.id,
      turmaId: dados.turma.id,
      atividades: respostaN8n.atividades,
      metadata: {
        ...respostaN8n.metadata,
        tema: dados.conteudo?.tema,
        tipo: dados.tipo_atividade,
        dificuldade: dados.nivel_dificuldade,
        quantidade: dados.quantidade,
      },
      revisado: false,
    });

    return {
      success: true,
      message: "Atividades geradas e salvas com sucesso.",
      data: novaAtividade,
    };
  } catch (error: any) {
    console.error("❌ Erro ao gerar atividade:", error);
    throw new Error(error.message || "Erro interno ao gerar atividades.");
  }
};

/* ============================================================
   🔹 3. LISTAGEM DE ATIVIDADES POR PROFESSOR
   ============================================================ */
export const listarAtividadesPorProfessor = async (professorId: string) => {
  try {
    const atividades = await AtividadeGerada.find({ professorId }).sort({ criadoEm: -1 });
    return { success: true, data: atividades };
  } catch (error) {
    console.error("❌ Erro ao listar atividades:", error);
    throw new Error("Erro ao buscar atividades do professor.");
  }
};

/* ============================================================
   🔹 4. REVISÃO DE ATIVIDADE
   ============================================================ */
export const revisarAtividade = async (id: string) => {
  try {
    const atividade = await AtividadeGerada.findByIdAndUpdate(
      id,
      { revisado: true },
      { new: true }
    );

    if (!atividade) throw new Error("Atividade não encontrada.");

    return { success: true, message: "Atividade revisada com sucesso.", data: atividade };
  } catch (error) {
    console.error("❌ Erro ao revisar atividade:", error);
    throw new Error("Erro interno ao revisar atividade.");
  }
};

/* ============================================================
   🔹 5. EXCLUSÃO DE ATIVIDADE
   ============================================================ */
export const excluirAtividade = async (id: string) => {
  try {
    const deletada = await AtividadeGerada.findByIdAndDelete(id);
    if (!deletada) throw new Error("Atividade não encontrada.");

    return { success: true, message: "Atividade excluída com sucesso." };
  } catch (error) {
    console.error("❌ Erro ao excluir atividade:", error);
    throw new Error("Erro interno ao excluir atividade.");
  }
};

/* ============================================================
   🔹 6. VALIDAÇÃO PEDAGÓGICA + FEEDBACK AO N8N
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
    const {
      id,
      explicacaoAtualizada,
      feedbackProfessor,
      qualidadeIA,
      comentario,
      professor,
      disciplina,
    } = payload;

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

    if (!atividade) throw new Error("Atividade não encontrada.");

    // Atualiza ou cria registro pedagógico
    await ValidacaoPedagogica.findOneAndUpdate(
      { professorId: professor.id, disciplinaId: disciplina.id },
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

    // 🔁 Feedback para o n8n
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
    console.error("❌ Erro em validarAtividade:", error);
    throw new Error("Erro ao validar e enviar feedback da atividade.");
  }
};

/* ============================================================
   🔹 7. RESUMO ANALÍTICO — COORDENAÇÃO PEDAGÓGICA
   ============================================================ */
export const obterResumoPedagogico = async () => {
  try {
    const registros = await ValidacaoPedagogica.find();

    const resumo = await Promise.all(
      registros.map(async (p) => {
        const totalGeradas = await AtividadeGerada.countDocuments({
          professorId: p.professorId,
        });

        const taxaAderencia =
          totalGeradas > 0 ? (p.atividadesValidadas / totalGeradas) * 100 : 0;

        const mediaQualidadeIA =
          p.feedbacks.length > 0
            ? Number(
                (
                  p.feedbacks.reduce(
                    (acc: number, f: { qualidadeIA: number }) =>
                      acc + (f.qualidadeIA || 0),
                    0
                  ) / p.feedbacks.length
                ).toFixed(1)
              )
            : 0;

        return {
          professor: p.nomeProfessor,
          disciplina: p.nomeDisciplina,
          totalGeradas,
          totalValidadas: p.atividadesValidadas,
          taxaAderencia: Number(taxaAderencia.toFixed(1)),
          mediaQualidadeIA,
          ultimaValidacao: p.ultimaValidacao,
        };
      })
    );

    return { success: true, data: resumo };
  } catch (error: any) {
    console.error("❌ Erro em obterResumoPedagogico:", error);
    throw new Error("Erro ao consolidar dados da coordenação pedagógica.");
  }
};
