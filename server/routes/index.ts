// server/routes/index.ts

import express from "express";
import cors from "cors";

// ✅ Importações compatíveis com Node ESM (.js após build)
import professorRoutes from "./professorRoutes.js";
import gradesRoutes from "./gradesRoutes.js";
import secretariaRoutes from "./secretariaRoutes.js";
import relatorioRoutes from "./relatorioRoutes.js";
import authRoutes from "./authRoutes.js";
import coordRoutes from "./coordRoutes.ts";



// ✅ Adicione o módulo de IA
import aiAtividadesRoutes from "./aiAtividadesRoutes.js";

const router = express.Router();

// ==========================================================
// 🧩 CONFIGURAÇÃO BÁSICA DE CORS (seguro e compatível)
// ==========================================================
router.use(
  cors({
    origin: [
      "http://localhost:5173", // ambiente local
      process.env.FRONTEND_URL || "", // produção
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==========================================================
// 🌐 Rotas básicas
// ==========================================================
router.get("/", (_req, res) => {
  res.status(200).send("✅ Welcome to AcademiaFlow API!");
});

router.get("/ping", (_req, res) => {
  res.status(200).send("pong");
});

// 🔹 Endpoint simples de debug opcional
router.get("/logs", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Log endpoint active — use only for diagnostics.",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================================
// 🚀 Rotas principais
// ==========================================================
router.use("/api", professorRoutes);
router.use("/api", gradesRoutes);
router.use("/api", secretariaRoutes);
router.use("/api", relatorioRoutes);
router.use("/api", authRoutes);

// ✅ NOVO módulo de IA — rotas /api/ai/*
router.use(aiAtividadesRoutes);
// ✅ NOVO módulo da Coordenação — rotas /api/coord/*
router.use("/api/coord", coordRoutes);


// ==========================================================
// ⚠️ Fallback genérico
// ==========================================================
router.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found. Please verify your API route.",
  });
});

export default router;
