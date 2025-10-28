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
    if (!webhookUrl) throw new Error("N8N_AI_WEBHOOK_URL não configurada no .env");

    console.log("🚀 Enviando dados ao n8n...");
    const resposta = await axios.post(webhookUrl, dados, {
      headers: { "Content-Type": "application/json" },
      timeout: 320000,
    });

    if (!resposta.data) throw new Error("Resposta vazia do n8n.");

    console.log("✅ Resposta recebida do n8n:", resposta.data);
    return resposta.data;
  } catch (error: any) {
    console.error("❌ Falha na comunicação com n8n:", error.message);
    throw new Error("Erro ao enviar dados para o n8n. Detalhes: " + error.message);
  }
};

/* ============================================================
   🔹 2. GERAÇÃO DE ATIVIDADE VIA IA (com normalização robusta)
   ============================================================ */
export const gerarAtividade = async (dados: any) => {
  try {
    if (!dados.professor || !dados.disciplina || !dados.turma || !dados.conteudo)
      throw new Error("Dados insuficientes para gerar atividades.");

    console.log("🧠 Gerando atividade via IA para:", {
      professor: dados.professor?.nome,
      disciplina: dados.disciplina?.id,
      turma: dados.turma?.id,
      tema: dados.conteudo?.tema,
    });

    const respostaN8n = await enviarParaN8n(dados);

    /* ============================================================
       🧩 Normalização de resposta do n8n
       - Aceita [{ output: {...} }]
       - Aceita { output: {...} }
       - Aceita { atividades: [...] }
    ============================================================ */
    let parsedData: any = respostaN8n;

    if (Array.isArray(respostaN8n)) {
      parsedData =
        respostaN8n[0]?.output ||
        respostaN8n[0]?.response?.output ||
        respostaN8n[0] ||
        {};
    } else if (respostaN8n.output) {
      parsedData = respostaN8n.output;
    } else if (respostaN8n.response?.output) {
      parsedData = respostaN8n.response.output;
    }

    if (!parsedData.atividades || !Array.isArray(parsedData.atividades)) {
      console.error("❌ Estrutura inesperada da resposta do n8n:", parsedData);
      throw new Error("Falha ao interpretar resposta do n8n (sem atividades).");
    }

    // 💾 Criação no banco
    const novaAtividade = await AtividadeGerada.create({
      professorId: dados.professor.id,
      disciplinaId: dados.disciplina.id,
      turmaId: dados.turma.id,
      atividades: parsedData.atividades,
      metadata: {
        ...parsedData.metadata,
        tema: dados.conteudo?.tema,
        tipo: dados.tipo_atividade,
        dificuldade: dados.nivel_dificuldade,
        quantidade: dados.quantidade,
      },
      revisado: false,
    });

    return { success: true, message: "Atividades geradas e salvas com sucesso.", data: novaAtividade };
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
    console.log("📡 Solicitando atividades do professor:", professorId);

    if (!professorId?.trim())
      return { success: false, data: [], message: "ID do professor ausente ou inválido." };

    const atividades = await AtividadeGerada.find({ professorId })
      .sort({ criadoEm: -1 })
      .lean();

    console.log(`📚 ${atividades.length} atividades encontradas para o professor.`);
    return { success: true, data: atividades, count: atividades.length };
  } catch (error: any) {
    console.error("❌ Erro ao listar atividades:", error.message);
    return { success: false, data: [], message: "Erro ao buscar atividades do professor.", details: error.message };
  }
};

/* ============================================================
   🔹 4. MARCAR ATIVIDADE COMO REVISADA
   ============================================================ */
export const revisarAtividade = async (id: string) => {
  try {
    const atividade = await AtividadeGerada.findByIdAndUpdate(id, { revisado: true }, { new: true });
    if (!atividade) throw new Error("Atividade não encontrada.");

    return { success: true, message: "Atividade revisada com sucesso.", data: atividade };
  } catch (error) {
    console.error("❌ Erro ao revisar atividade:", error);
    throw new Error("Erro interno ao revisar atividade.");
  }
};

/* ============================================================
   🔹 5. EXCLUSÃO DE UMA ÚNICA ATIVIDADE
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
   🔹 6. EXCLUSÃO DE TODAS AS ATIVIDADES DE UM PROFESSOR
   ============================================================ */
export const excluirAtividadesPorProfessor = async (professorId: string) => {
  try {
    if (!professorId?.trim()) throw new Error("ProfessorId não informado.");

    console.log("🧹 Limpando atividades do professor:", professorId);
    const resultado = await AtividadeGerada.deleteMany({ professorId });

    if (resultado.deletedCount === 0)
      return { success: false, message: "Nenhuma atividade encontrada para este professor." };

    console.log(`🗑️ ${resultado.deletedCount} atividades excluídas com sucesso.`);
    return { success: true, message: `${resultado.deletedCount} atividades excluídas com sucesso.` };
  } catch (error: any) {
    console.error("❌ Erro ao excluir atividades por professor:", error.message);
    return { success: false, message: "Erro interno ao excluir atividades do professor.", details: error.message };
  }
};

/* ============================================================
   🔹 7. VALIDAÇÃO PEDAGÓGICA + FEEDBACK AO N8N
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

    const atividade = await AtividadeGerada.findByIdAndUpdate(
      id,
      { validado: true, explicacaoAtualizada, feedbackProfessor, validadoEm: new Date() },
      { new: true }
    );

    if (!atividade) throw new Error("Atividade não encontrada.");

    await ValidacaoPedagogica.findOneAndUpdate(
      { professorId: professor.id, disciplinaId: disciplina.id },
      {
        $set: { nomeProfessor: professor.nome, nomeDisciplina: disciplina.nome, ultimaValidacao: new Date() },
        $inc: { atividadesValidadas: 1 },
        $push: { feedbacks: { atividadeId: atividade._id, comentario, qualidadeIA } },
      },
      { upsert: true, new: true }
    );

    await enviarFeedbackParaN8n({
      professor,
      disciplina,
      atividadeId: id,
      explicacaoAnterior: atividade.explicacaoAnterior ?? "",
      explicacaoNova: explicacaoAtualizada,
      avaliacaoProfessor: { qualidade: qualidadeIA, comentario },
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: "Atividade validada e feedback enviado com sucesso.", data: atividade };
  } catch (error: any) {
    console.error("❌ Erro em validarAtividade:", error);
    throw new Error("Erro ao validar e enviar feedback da atividade.");
  }
};

/* ============================================================
   🔹 8. RESUMO ANALÍTICO — COORDENAÇÃO PEDAGÓGICA
   ============================================================ */
export const obterResumoPedagogico = async () => {
  try {
    const registros = await ValidacaoPedagogica.find();

    const resumo = await Promise.all(
      registros.map(async (p) => {
        const totalGeradas = await AtividadeGerada.countDocuments({ professorId: p.professorId });
        const taxaAderencia = totalGeradas > 0 ? (p.atividadesValidadas / totalGeradas) * 100 : 0;
        const mediaQualidadeIA =
          p.feedbacks.length > 0
            ? Number(
                (p.feedbacks.reduce((acc: number, f: { qualidadeIA: number }) => acc + (f.qualidadeIA || 0), 0) /
                  p.feedbacks.length).toFixed(1)
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
