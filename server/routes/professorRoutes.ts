// server/routes/professorRoutes.ts
import { Router, Request, Response } from 'express';
import { getDisciplinasByProfessor } from '../services/professorService';
import { requireUser } from './middlewares/auth'; // Importa seu middleware
import { ROLES } from 'shared'; // Importa ROLES para usar as constantes

const router = Router();

// Endpoint para listar disciplinas de um professor
router.get(
  '/api/professor/disciplinas', // <--- Prefixei com /api aqui
  requireUser([ROLES.PROFESSOR]), // Usa o middleware requireUser, permitindo apenas a role 'professor'
  async (req: Request, res: Response) => {
    try {
      // req.user já está tipado como IUser, então podemos acessar _id diretamente
      const professorId = req.user!._id.toString(); // ! para garantir que req.user não é undefined aqui

      const disciplinas = await getDisciplinasByProfessor(professorId);
      res.json(disciplinas);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Error fetching professor disciplines.' });
    }
  }
);

export default router;