// server/routes/coordRoutes.ts


import { Router, Request, Response } from "express";
import { requireUser } from "./middlewares/auth.js";
import { ROLES } from "shared";
import { validateActivity, getCoordActivities, getCoordDashboard } from "../services/coordService.js";

const router = Router();

/* ============================================================
   🔒 Middleware de autenticação base
============================================================ */
router.use(async (req: Request, _res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      req.token = authHeader.split(" ")[1];
    }
    next();
  } catch (err) {
    console.error("⚠️ Erro ao processar Authorization Header:", err);
    next();
  }
});

/* ============================================================
   🔹 GET /api/coord/dashboard
============================================================ */
router.get(
  "/dashboard",
  requireUser([ROLES.COORDENACAO, ROLES.ADMIN]),
  async (_req: Request, res: Response) => {
    try {
      const data = await getCoordDashboard();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("❌ Erro em /coord/dashboard:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao gerar dashboard da coordenação." });
    }
  }
);

/* ============================================================
   🔹 GET /api/coord/atividades
============================================================ */
router.get(
  "/atividades",
  requireUser([ROLES.COORDENACAO, ROLES.ADMIN]),
  async (_req: Request, res: Response) => {
    try {
      const data = await getCoordActivities();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("❌ Erro em /coord/atividades:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao buscar atividades geradas." });
    }
  }
);

/* ============================================================
   🔹 PATCH /api/coord/atividades/:id/validar
============================================================ */
router.patch(
  "/atividades/:id/validar",
  requireUser([ROLES.COORDENACAO, ROLES.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      // 🛡️ Type guard seguro
      const user = req.user as any;
      if (!user || !user._id) {
        return res.status(401).json({ success: false, message: "Usuário não autenticado ou inválido." });
      }

      const { id } = req.params;
      const result = await validateActivity(id, req.body, { _id: user._id });

      return res.json({
        success: true,
        message: "Atividade validada com sucesso.",
        data: result,
      });
    } catch (error: any) {
      console.error("❌ Erro em /coord/atividades/:id/validar:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao validar atividade." });
    }
  }
);

export default router;
