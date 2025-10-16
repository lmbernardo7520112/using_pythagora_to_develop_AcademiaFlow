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

router.post("/secretaria/turmas", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const nova = await secretariaService.createTurma(req.body);
    return res.status(201).json(nova);
  } catch (err: any) {
    console.error("❌ secretariaRoutes.createTurma:", err);
    return res.status(400).json({ message: err.message });
  }
});

router.put("/secretaria/turmas/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const updated = await secretariaService.updateTurma(req.params.id, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    console.error("❌ secretariaRoutes.updateTurma:", err);
    return res.status(400).json({ message: err.message });
  }
});

router.delete("/secretaria/turmas/:id", requireSecretaria, async (req: Request, res: Response) => {
  try {
    await secretariaService.disableTurma(req.params.id);
    return res.status(200).json({ message: "Turma desativada com sucesso" });
  } catch (err) {
    console.error("❌ secretariaRoutes.disableTurma:", err);
    return res.status(500).json({ message: "Erro ao desativar turma" });
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

// ✏️ Atualização de status de aluno
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
<<<<<<< HEAD
// 📚 DISCIPLINAS — novas rotas
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

router.put("/secretaria/turmas/:turmaId/alunos/manage", requireSecretaria, async (req: Request, res: Response) => {
  try {
    const { turmaId } = req.params;
    const { alunosIds } = req.body;
    const turma = await secretariaService.updateAlunosInTurma(turmaId, alunosIds);
    return res.status(200).json(turma);
  } catch (err) {
    console.error("❌ secretariaRoutes.updateAlunosInTurma:", err);
    return res.status(500).json({ message: "Erro ao atualizar alunos na turma" });
  }
});

// ==========================================================
// 📈 TAXAS DE APROVAÇÃO
=======
// 📚 DISCIPLINAS
>>>>>>> feature/prd003-secretary-class-view-refactor
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

export default router;
