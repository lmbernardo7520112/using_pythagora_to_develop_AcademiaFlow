// server/routes/professorRoutes.ts

import { Router, Request, Response } from "express";
import { getDisciplinasByProfessor } from "../services/professorService";
import { requireUser } from "./middlewares/auth";
import { ROLES } from "shared";

const router = Router();

// ===================================================
// ROTA: Disciplinas do professor autenticado
// ===================================================
router.get(
  "/api/professor/disciplinas",
  requireUser([ROLES.PROFESSOR]), // Apenas professores
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: no user in request." });
      }

      const professorId = req.user._id.toString();
      const disciplinas = await getDisciplinasByProfessor(professorId);

      return res.json({ success: true, data: disciplinas });
    } catch (error: any) {
      console.error("Error in /api/professor/disciplinas:", error);
      res
        .status(500)
        .json({ message: error.message || "Error fetching professor disciplines." });
    }
  }
);

export default router;
