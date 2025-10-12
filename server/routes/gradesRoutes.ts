// server/routes/gradesRoutes.ts

import { Router, Request, Response } from 'express';
import { getGradesByTurmaAndDisciplina, saveGrades } from '../services/gradeService.js';
import { requireUser } from './middlewares/auth.js';
import { ROLES } from 'shared';

const router = Router();

/**
 * GET /api/notas/:turmaId/:disciplinaId
 * (o /api vem do index.ts)
 */
router.get(
  '/notas/:turmaId/:disciplinaId',
  requireUser([ROLES.PROFESSOR]),
  async (req: Request, res: Response) => {
    try {
      const { turmaId, disciplinaId } = req.params;

      if (!turmaId || !disciplinaId) {
        return res
          .status(400)
          .json({ message: 'Turma ID and Disciplina ID are required.' });
      }

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
 * POST /api/notas/salvar
 */
router.post(
  '/notas/salvar',
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
