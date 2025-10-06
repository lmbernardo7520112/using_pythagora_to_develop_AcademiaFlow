// server/routes/gradesRoutes.ts

import { Router, Request, Response } from 'express';
import { getGradesByTurmaAndDisciplina, saveGrades } from '../services/gradeService';
import { requireUser } from './middlewares/auth'; // middleware de autenticação
import { ROLES } from 'shared'; // Importa constantes de roles

const router = Router();

/**
 * 🔹 GET /api/notas/:turmaId/:disciplinaId
 * Recupera as notas de todos os alunos de uma turma e disciplina
 */
router.get(
  '/api/notas/:turmaId/:disciplinaId',
  requireUser([ROLES.PROFESSOR]),
  async (req: Request, res: Response) => {
    try {
      const { turmaId, disciplinaId } = req.params;

      if (!turmaId || !disciplinaId) {
        return res
          .status(400)
          .json({ message: 'Turma ID and Disciplina ID are required.' });
      }

      // Opcional: validar se o professor logado pode acessar essa turma/disciplina
      // const professorId = req.user!._id.toString();

      const grades = await getGradesByTurmaAndDisciplina(turmaId, disciplinaId);
      res.json(grades);
    } catch (error: any) {
      console.error('❌ Error fetching grades:', error);
      res
        .status(500)
        .json({ message: error.message || 'Error fetching grades.' });
    }
  }
);

/**
 * 🔹 POST /api/notas/salvar
 * Salva ou atualiza notas de uma turma/disciplina em transação atômica
 */
router.post(
  '/api/notas/salvar',
  requireUser([ROLES.PROFESSOR]),
  async (req: Request, res: Response) => {
    try {
      const { turmaId, disciplinaId, updates } = req.body;

      if (!turmaId || !disciplinaId || !Array.isArray(updates)) {
        return res.status(400).json({
          message:
            'Turma ID, Disciplina ID, and updates array are required.',
        });
      }

      // 🔑 Agora passamos o professor logado como updatedBy
      const updatedBy = req.user?._id?.toString();
      if (!updatedBy) {
        return res.status(401).json({ message: 'Unauthorized: missing user.' });
      }

      await saveGrades(turmaId, disciplinaId, updates, updatedBy);

      res.status(200).json({ message: 'Grades saved successfully.' });
    } catch (error: any) {
      console.error('❌ Error saving grades:', error);
      res
        .status(500)
        .json({ message: error.message || 'Error saving grades.' });
    }
  }
);

export default router;
