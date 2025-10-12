// server/routes/professorRoutes.ts

import { Router, Request, Response } from "express";
import { getDisciplinasByProfessor } from "../services/professorService.js";
import { requireUser } from "./middlewares/auth.js";
import { ROLES } from "shared";

const router = Router();

/**
 * GET /api/professor/disciplinas
 * (o /api vem do index.ts)
 */
router.get(
  "/professor/disciplinas",
  requireUser([ROLES.PROFESSOR]),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        console.warn("Rota /api/professor/disciplinas: req.user is missing.");
        return res.status(401).json({ message: "Unauthorized: no user in request." });
      }

      const professorId = req.user._id.toString();
      console.log(`[Backend] Fetching disciplines for professor ID: ${professorId}`);

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
