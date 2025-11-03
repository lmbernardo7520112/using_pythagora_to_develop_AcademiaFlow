// server/routes/secretariaRoutes.ts

import express, { Request, Response } from "express";
import { requireUser } from "./middlewares/auth.js";
import secretariaService from "../services/secretariaService.js";

const router = express.Router();
const requireSecretaria = requireUser(["secretaria", "admin", "administrador"]);

console.log("✅ secretariaRoutes.ts carregado com sucesso!");

// ==========================================================
// 📊 DASHBOARD
// ==========================================================
router.get("/secretaria/dashboard", requireSecretaria, async (_req: Request, res: Response) => {
  try {
    const data = await secretariaService.getDashboardGeral();
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ secretariaRoutes.getDashboardGeral:", err);
    return res.status(500).json({ message: "Erro ao gerar dashboard geral" });
  }
});

router.get("/secretaria/turmas/:id/dashboard", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const data = await secretariaService.getDashboardTurma(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ secretariaRoutes.getDashboardTurma:", err);
    return res.status(500).json({ message: "Erro ao gerar dashboard da turma" });
  }
});

// ==========================================================
// 🎓 TURMAS
// ==========================================================
router.get("/secretaria/turmas", requireSecretaria, async (_req: Request, res: Response) => {
  try {
    const turmas = await secretariaService.listTurmas();
    return res.status(200).json(turmas);
  } catch (err) {
    console.error("❌ secretariaRoutes.listTurmas:", err);
    return res.status(500).json({ message: "Erro ao listar turmas" });
  }
});

router.get("/secretaria/turmas/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const turma = await secretariaService.getTurmaById(req.params.id);
    if (!turma) return res.status(404).json({ message: "Turma não encontrada" });
    return res.status(200).json(turma);
  } catch (err) {
    console.error("❌ secretariaRoutes.getTurmaById:", err);
    return res.status(500).json({ message: "Erro ao obter turma" });
  }
});

router.put("/secretaria/turmas/:turmaId/alunos/manage", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const { turmaId } = req.params;
    const { alunosIds } = req.body;
    const turmaAtualizada = await secretariaService.updateAlunosInTurma(turmaId, alunosIds);
    return res.status(200).json(turmaAtualizada);
  } catch (err) {
    console.error("❌ secretariaRoutes.updateAlunosInTurma:", err);
    return res.status(500).json({ message: "Erro ao atualizar alunos na turma" });
  }
});

// ==========================================================
// 👩‍🎓 ALUNOS
// ==========================================================
router.get("/secretaria/turmas/:turmaId/alunos", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const alunos = await secretariaService.listAlunosByTurma(req.params.turmaId);
    return res.status(200).json(alunos);
  } catch (err) {
    console.error("❌ secretariaRoutes.listAlunosByTurma:", err);
    return res.status(500).json({ message: "Erro ao listar alunos da turma" });
  }
});

router.put("/secretaria/alunos/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const alunoAtualizado = await secretariaService.updateAluno(req.params.id, req.body);
    return res.status(200).json(alunoAtualizado);
  } catch (err: any) {
    console.error("❌ secretariaRoutes.updateAluno:", err);
    return res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 📚 DISCIPLINAS
// ==========================================================
router.get("/secretaria/disciplinas", requireSecretaria, async (_req: Request, res: Response) => {
  try {
    const disciplinas = await secretariaService.listDisciplinas();
    return res.status(200).json(disciplinas);
  } catch (err) {
    console.error("❌ secretariaRoutes.listDisciplinas:", err);
    return res.status(500).json({ message: "Erro ao listar disciplinas" });
  }
});

router.put("/secretaria/disciplinas/:id/professor", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const updated = await secretariaService.assignProfessorToDisciplina(req.params.id, req.body.professorId);
    return res.status(200).json(updated);
  } catch (err) {
    console.error("❌ secretariaRoutes.assignProfessorToDisciplina:", err);
    return res.status(500).json({ message: "Erro ao atribuir professor à disciplina" });
  }
});

router.put("/secretaria/disciplinas/:id/turma", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const updated = await secretariaService.assignTurmaToDisciplina(req.params.id, req.body.turmaId);
    return res.status(200).json(updated);
  } catch (err) {
    console.error("❌ secretariaRoutes.assignTurmaToDisciplina:", err);
    return res.status(500).json({ message: "Erro ao vincular turma à disciplina" });
  }
});

// ==========================================================
// 📊 RELATÓRIOS E TAXAS DE APROVAÇÃO
// ==========================================================
router.get("/secretaria/relatorios/taxas", requireSecretaria, async (_req: Request, res: Response) => {
  try {
    const data = await secretariaService.getTaxasAprovacao();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("❌ secretariaRoutes.getTaxasAprovacao:", err);
    return res.status(500).json({ success: false, message: "Erro ao obter taxas de aprovação." });
  }
});

export default router;
