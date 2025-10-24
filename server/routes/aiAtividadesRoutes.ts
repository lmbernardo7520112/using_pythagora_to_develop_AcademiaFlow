// server/routes/aiAtividadesRoutes.ts

import express from "express";
import {
  gerarAtividade,
  listarAtividadesPorProfessor,
  revisarAtividade,
  excluirAtividade,
} from "../services/aiAtividadesService.ts";

const router = express.Router();

/* ============================================================
   🔹 1. GERAR NOVA ATIVIDADE VIA IA
   ============================================================ */
router.post("/api/ai/gerarAtividade", async (req, res) => {
  try {
    console.log("📥 Requisição recebida para geração de atividade...");
    const resultado = await gerarAtividade(req.body);

    if (!resultado?.success) {
      return res.status(400).json({
        success: false,
        message: resultado?.message || "Falha ao gerar atividades.",
      });
    }

    res.status(200).json(resultado);
  } catch (error: any) {
    console.error("❌ Erro na rota /api/ai/gerarAtividade:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erro interno ao gerar atividade.",
    });
  }
});

/* ============================================================
   🔹 2. LISTAR ATIVIDADES POR PROFESSOR
   ============================================================ */
router.get("/api/ai/atividades/:professorId", async (req, res) => {
  try {
    const { professorId } = req.params;
    console.log("📡 Buscando atividades para professor:", professorId);

    const resultado = await listarAtividadesPorProfessor(professorId);

    if (!resultado?.success) {
      return res.status(400).json({
        success: false,
        message:
          resultado?.message || "Erro ao buscar atividades do professor.",
        details: resultado?.details || null,
      });
    }

    res.status(200).json(resultado);
  } catch (error: any) {
    console.error("❌ Erro na rota /api/ai/atividades/:professorId:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erro interno ao listar atividades.",
    });
  }
});

/* ============================================================
   🔹 3. MARCAR ATIVIDADE COMO REVISADA
   ============================================================ */
router.patch("/api/ai/atividades/:id/revisar", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Revisando atividade:", id);

    const resultado = await revisarAtividade(id);
    res.status(200).json(resultado);
  } catch (error: any) {
    console.error("❌ Erro na rota /api/ai/atividades/:id/revisar:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erro interno ao revisar atividade.",
    });
  }
});

/* ============================================================
   🔹 4. EXCLUIR ATIVIDADE
   ============================================================ */
router.delete("/api/ai/atividades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Excluindo atividade:", id);

    const resultado = await excluirAtividade(id);
    res.status(200).json(resultado);
  } catch (error: any) {
    console.error("❌ Erro na rota /api/ai/atividades/:id:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erro interno ao excluir atividade.",
    });
  }
});

export default router;
