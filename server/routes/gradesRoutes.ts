// server/routes/gradesRoutes.ts
import { Router, Request, Response } from 'express';
import { getGradesByTurmaAndDisciplina, saveGrades } from '../services/gradeService';
import { requireUser } from './middlewares/auth'; // Importa seu middleware
import { ROLES } from 'shared'; // Importa ROLES para usar as constantes

const router = Router();

// Endpoint para buscar notas de uma turma para uma disciplina
router.get(
  '/api/notas/:turmaId/:disciplinaId', // <--- Prefixei com /api aqui
  requireUser([ROLES.PROFESSOR]), // Apenas professores podem buscar notas
  async (req: Request, res: Response) => {
    try {
      const { turmaId, disciplinaId } = req.params;

      if (!turmaId || !disciplinaId) {
        return res.status(400).json({ message: 'Turma ID and Disciplina ID are required.' });
      }
      // Opcional: Verificar se o professor logado tem acesso a essa turma/disciplina
      // const professorId = req.user!._id.toString();
      // Lógica de verificação de permissão aqui...

      const grades = await getGradesByTurmaAndDisciplina(turmaId, disciplinaId);
      res.json(grades);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Error fetching grades.' });
    }
  }
);

// Endpoint para salvar/atualizar notas
router.post(
  '/api/notas/salvar', // <--- Prefixei com /api aqui
  requireUser([ROLES.PROFESSOR]), // Apenas professores podem salvar notas
  async (req: Request, res: Response) => {
    try {
      const { turmaId, disciplinaId, updates } = req.body; // updates: [{ alunoId, nota }]

      if (!turmaId || !disciplinaId || !Array.isArray(updates)) {
        return res.status(400).json({ message: 'Turma ID, Disciplina ID, and updates array are required.' });
      }
      // Opcional: Verificar se o professor logado tem acesso para modificar essa turma/disciplina
      // const professorId = req.user!._id.toString();
      // Lógica de verificação de permissão aqui...

      await saveGrades(turmaId, disciplinaId, updates);
      res.status(200).json({ message: 'Grades saved successfully.' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Error saving grades.' });
    }
  }
);

export default router;