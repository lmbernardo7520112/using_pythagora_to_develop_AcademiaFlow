// server/routes/secretariaRoutes.ts
import express, { Request, Response } from "express";
import { requireUser } from "./middlewares/auth.js";
import secretariaService from "../services/secretariaService.js";

const router = express.Router();

// Roles permitidos para secretária / admin
const requireSecretaria = requireUser(["secretaria", "admin", "administrador"]);

// -------------------- TURMAS --------------------

// Listar turmas ativas
router.get("/api/secretaria/turmas", requireSecretaria, async (_req: Request, res: Response) => {
  try {
    const turmas = await secretariaService.listTurmas();
    return res.status(200).json(turmas);
  } catch (err) {
    console.error("secretariaRoutes.listTurmas:", err);
    return res.status(500).json({ message: "Erro ao listar turmas" });
  }
});

// Obter turma por id
router.get("/api/secretaria/turmas/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const turma = await secretariaService.getTurmaById(req.params.id);
    if (!turma) return res.status(404).json({ message: "Turma não encontrada" });
    return res.status(200).json(turma);
  } catch (err) {
    console.error("secretariaRoutes.getTurmaById:", err);
    return res.status(500).json({ message: "Erro ao obter turma" });
  }
});

// Criar turma
router.post("/api/secretaria/turmas", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const nova = await secretariaService.createTurma(req.body);
    return res.status(201).json(nova);
  } catch (err: any) {
    console.error("secretariaRoutes.createTurma:", err);
    return res.status(400).json({ message: err.message || "Erro ao criar turma" });
  }
});

// Atualizar turma
router.put("/api/secretaria/turmas/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const updated = await secretariaService.updateTurma(req.params.id, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    console.error("secretariaRoutes.updateTurma:", err);
    return res.status(400).json({ message: err.message || "Erro ao atualizar turma" });
  }
});

// Desativar turma (soft)
router.delete("/api/secretaria/turmas/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    await secretariaService.disableTurma(req.params.id);
    return res.status(200).json({ message: "Turma desativada com sucesso" });
  } catch (err) {
    console.error("secretariaRoutes.disableTurma:", err);
    return res.status(500).json({ message: "Erro ao desativar turma" });
  }
});

// -------------------- ALUNOS --------------------

// Listar alunos por turma
router.get("/api/secretaria/turmas/:turmaId/alunos", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const alunos = await secretariaService.listAlunosByTurma(req.params.turmaId);
    return res.status(200).json(alunos);
  } catch (err) {
    console.error("secretariaRoutes.listAlunosByTurma:", err);
    return res.status(500).json({ message: "Erro ao listar alunos da turma" });
  }
});

// Criar aluno na turma
router.post("/api/secretaria/turmas/:turmaId/alunos", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const aluno = await secretariaService.createAluno(req.params.turmaId, req.body);
    return res.status(201).json(aluno);
  } catch (err: any) {
    console.error("secretariaRoutes.createAluno:", err);
    return res.status(400).json({ message: err.message || "Erro ao criar aluno" });
  }
});

// Atualizar aluno
router.put("/api/secretaria/alunos/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const aluno = await secretariaService.updateAluno(req.params.id, req.body);
    return res.status(200).json(aluno);
  } catch (err: any) {
    console.error("secretariaRoutes.updateAluno:", err);
    return res.status(400).json({ message: err.message || "Erro ao atualizar aluno" });
  }
});

// Desativar aluno
router.delete("/api/secretaria/alunos/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    await secretariaService.disableAluno(req.params.id);
    return res.status(200).json({ message: "Aluno desativado com sucesso" });
  } catch (err) {
    console.error("secretariaRoutes.disableAluno:", err);
    return res.status(500).json({ message: "Erro ao desativar aluno" });
  }
});

// -------------------- DASHBOARD / TAXAS --------------------

// Dashboard geral
router.get("/api/secretaria/dashboard", requireSecretaria, async (_req: Request, res: Response) => {
  try {
    const data = await secretariaService.getDashboardGeral();
    return res.status(200).json(data);
  } catch (err) {
    console.error("secretariaRoutes.getDashboardGeral:", err);
    return res.status(500).json({ message: "Erro ao gerar dashboard" });
  }
});

// Dashboard por turma
router.get("/api/secretaria/turmas/:id/dashboard", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const data = await secretariaService.getDashboardTurma(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    console.error("secretariaRoutes.getDashboardTurma:", err);
    return res.status(500).json({ message: "Erro ao gerar dashboard da turma" });
  }
});

// Taxas de aprovação (por bimestre opcional)
router.get("/api/secretaria/taxas-aprovacao", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const bimestre = req.query.bimestre ? Number(req.query.bimestre) : undefined;
    const data = await secretariaService.getTaxasAprovacao(bimestre);
    return res.status(200).json(data);
  } catch (err) {
    console.error("secretariaRoutes.getTaxasAprovacao:", err);
    return res.status(500).json({ message: "Erro ao calcular taxas de aprovação" });
  }
});

export default router;
