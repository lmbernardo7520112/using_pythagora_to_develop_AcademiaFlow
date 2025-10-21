// server/routes/aiAtividadesRoutes.ts

import express from "express";
import {
  gerarAtividade,
  listarAtividadesPorProfessor,
  revisarAtividade,
  excluirAtividade,
} from "../services/aiAtividadesService.ts";

const router = express.Router();

router.post("/api/ai/gerarAtividade", gerarAtividade);
router.get("/api/ai/atividades/:professorId", listarAtividadesPorProfessor);
router.patch("/api/ai/atividades/:id/revisar", revisarAtividade);
router.delete("/api/ai/atividades/:id", excluirAtividade);

export default router;
