// server/routes/coordRoutes.ts

import { Router, Request, Response } from "express";
import { requireUser } from "./middlewares/auth.js";
import { ROLES } from "shared";
import { AtividadeGerada } from "../models/AtividadeGerada.js";
import { ValidacaoPedagogica } from "../models/ValidacaoPedagogica.js";
import { validarAtividade } from "../services/aiFeedbackService.js";
import relatorioService from "../services/relatorioService.js";

const router = Router();

/**
 * ============================================================
 *  🔹 GET /api/coord/dashboard
 *  Painel principal da coordenação pedagógica
 * ============================================================
 */
router.get(
  "/coord/dashboard",
  requireUser([ROLES.COORDENACAO, ROLES.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      console.log("[Coordenação] Requisição para dashboard recebida.");

      const totalAtividades = await AtividadeGerada.countDocuments();
      const atividadesValidadas = await AtividadeGerada.countDocuments({ validado: true });
      const pendentes = await AtividadeGerada.countDocuments({ validado: { $ne: true } });

      // Dados de desempenho agregados por turma
      const turmasAnalytics = await relatorioService.getResumoPorTurma();

      return res.status(200).json({
        success: true,
        data: {
          totalAtividades,
          atividadesValidadas,
          pendentes,
          turmasAnalytics,
        },
      });
    } catch (error: any) {
      console.error("❌ Erro em /api/coord/dashboard:", error);
      return res
        .status(500)
        .json({ message: "Erro ao gerar dashboard da coordenação." });
    }
  }
);

/**
 * ============================================================
 *  🔹 GET /api/coord/atividades
 *  Lista atividades geradas por professores
 * ============================================================
 */
router.get(
  "/coord/atividades",
  requireUser([ROLES.COORDENACAO, ROLES.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      console.log("[Coordenação] Buscando atividades geradas por professores...");

      const atividades = await AtividadeGerada.find({})
        .populate("professorId", "nome email")
        .populate("disciplinaId", "nome")
        .populate("turmaId", "nome")
        .sort({ createdAt: -1 });

      return res.json({ success: true, data: atividades });
    } catch (error: any) {
      console.error("❌ Erro em /api/coord/atividades:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar atividades geradas." });
    }
  }
);

/**
 * ============================================================
 *  🔹 PATCH /api/coord/atividades/:id/validar
 *  Validação e feedback da coordenação pedagógica
 * ============================================================
 */
router.patch(
  "/coord/atividades/:id/validar",
  requireUser([ROLES.COORDENACAO, ROLES.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        console.warn("⚠️ Rota /api/coord/atividades/:id/validar: req.user is missing.");
        return res.status(401).json({ message: "Unauthorized: no user in request." });
      }

      const { id } = req.params;
      const { feedback, validado, qualidadeIA, comentario, disciplinaId, disciplinaNome } = req.body;

      const payload = {
        id,
        explicacaoAtualizada: feedback || "",
        comentario: comentario || "Revisão feita pela coordenação pedagógica.",
        qualidadeIA: qualidadeIA ?? 5,
        professor: {
          id: req.user._id.toString(),
          nome: req.user.nome || "Coordenação",
        },
        disciplina: {
          id: disciplinaId ?? "",
          nome: disciplinaNome ?? "",
        },
      };

      console.log(`[Coordenação] Validando atividade ${id} com payload:`, payload);

      const result = await validarAtividade(payload);

      // Atualiza campos locais na coleção principal
      await AtividadeGerada.findByIdAndUpdate(id, {
        feedbackCoordenacao: feedback,
        validado,
        validadoEm: new Date(),
        validadoPor: req.user._id,
      });

      return res.json({ success: true, message: "Atividade validada com sucesso.", data: result });
    } catch (error: any) {
      console.error("❌ Erro em /api/coord/atividades/:id/validar:", error);
      return res
        .status(500)
        .json({ message: "Erro ao validar atividade." });
    }
  }
);

/**
 * ============================================================
 *  🔹 GET /api/coord/relatorios/validacoes
 *  Histórico de feedbacks pedagógicos
 * ============================================================
 */
router.get(
  "/coord/relatorios/validacoes",
  requireUser([ROLES.COORDENACAO, ROLES.ADMIN]),
  async (_req: Request, res: Response) => {
    try {
      console.log("[Coordenação] Carregando histórico de validações pedagógicas...");

      const validacoes = await ValidacaoPedagogica.find()
        .populate("professorId", "nome")
        .populate("disciplinaId", "nome")
        .sort({ ultimaValidacao: -1 });

      return res.json({ success: true, data: validacoes });
    } catch (error: any) {
      console.error("❌ Erro em /api/coord/relatorios/validacoes:", error);
      return res
        .status(500)
        .json({ message: "Erro ao carregar relatórios de validação." });
    }
  }
);

export default router;
