// server/routes/relatorioRoutes.ts


import express from "express";
import { requireUser } from "./middlewares/auth.js";
import relatorioService from "../services/relatorioService.js";
import { AtividadeGerada } from "../models/AtividadeGerada.ts";

const router = express.Router();

// Roles autorizadas: secretaria, coordenação, admin
const requireRelatoriosAccess = requireUser(["secretaria", "coordenacao", "admin"]);

/**
 * GET /api/secretaria/relatorios
 * Acesso existente (mantido)
 */
router.get("/secretaria/relatorios", requireUser(["secretaria", "admin"]), async (req, res) => {
  try {
    const bimestre = req.query.bimestre ? Number(req.query.bimestre) : undefined;
    const data = await relatorioService.getRelatorios(bimestre);
    return res.status(200).json(data);
  } catch (err) {
    console.error("relatorioRoutes.getRelatorios:", err);
    return res.status(500).json({ message: "Erro ao gerar relatórios" });
  }
});

/**
 * GET /api/coord/atividades
 * Retorna todas as atividades geradas pelos professores
 * para acompanhamento e validação pedagógica pela coordenação
 */
router.get("/coord/atividades", requireRelatoriosAccess, async (req, res) => {
  try {
    const atividades = await AtividadeGerada.find({})
      .populate("professorId", "nome email")
      .populate("disciplinaId", "nome")
      .populate("turmaId", "nome")
      .sort({ criadoEm: -1 });

    return res.status(200).json(atividades);
  } catch (err) {
    console.error("Erro ao buscar atividades:", err);
    return res.status(500).json({ message: "Erro ao buscar atividades" });
  }
});

/**
 * PATCH /api/coord/atividades/:id/validar
 * Atualiza o status de validação e feedback pedagógico
 * (coordenação apenas revisa e valida)
 */
router.patch("/coord/atividades/:id/validar", requireRelatoriosAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, validado } = req.body;

    const result = await AtividadeGerada.findByIdAndUpdate(
      id,
      { feedbackCoordenacao: feedback, validado, revisado: true },
      { new: true }
    );

    if (!result) return res.status(404).json({ message: "Atividade não encontrada" });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao validar atividade:", err);
    return res.status(500).json({ message: "Erro ao validar atividade" });
  }
});

export default router;
