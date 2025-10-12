// server/routes/relatorioRoutes.ts

import express from "express";
import { requireUser } from "./middlewares/auth.js";
import relatorioService from "../services/relatorioService.js";

const router = express.Router();
const requireSecretaria = requireUser(["secretaria", "admin"]);

/**
 * GET /api/secretaria/relatorios
 */
router.get("/secretaria/relatorios", requireSecretaria, async (req, res) => {
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
 * GET /api/secretaria/relatorios/taxas
 */
router.get("/secretaria/relatorios/taxas", requireSecretaria, async (req, res) => {
  try {
    const bimestre = req.query.bimestre ? Number(req.query.bimestre) : undefined;
    const data = await relatorioService.getTaxasPorTurma(bimestre);
    res.status(200).json(data);
  } catch (err) {
    console.error("relatorioRoutes.getTaxas:", err);
    res.status(500).json({ message: "Erro ao gerar taxas" });
  }
});

/**
 * GET /api/secretaria/relatorios/alunos
 */
router.get("/secretaria/relatorios/alunos", requireSecretaria, async (req, res) => {
  try {
    const { turmaId, nome, ativo, page, limit } = req.query;
    const params = {
      turmaId: typeof turmaId === "string" ? turmaId : undefined,
      nome: typeof nome === "string" ? nome : undefined,
      ativo: typeof ativo === "string" ? (ativo === "true") : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 100,
    };
    const data = await relatorioService.listAlunosFiltered(params);
    res.status(200).json(data);
  } catch (err) {
    console.error("relatorioRoutes.listAlunos:", err);
    res.status(500).json({ message: "Erro ao listar alunos" });
  }
});

/**
 * GET /api/secretaria/relatorios/export/xlsx
 */
router.get("/secretaria/relatorios/export/xlsx", requireSecretaria, async (req, res) => {
  try {
    const turmaId = typeof req.query.turmaId === "string" ? req.query.turmaId : undefined;
    const { buffer, filename } = await relatorioService.generateExcelReport({ turmaId });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error("relatorioRoutes.exportXlsx:", err);
    res.status(500).json({ message: "Erro ao gerar arquivo XLSX" });
  }
});

export default router;
