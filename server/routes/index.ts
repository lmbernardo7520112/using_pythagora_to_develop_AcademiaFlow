// server/routes/index.ts


import express from "express";
import cors from "cors";

// ✅ Importações compatíveis com Node ESM (.js após build)
import professorRoutes from "./professorRoutes.js";
import gradesRoutes from "./gradesRoutes.js";
import secretariaRoutes from "./secretariaRoutes.js";
import relatorioRoutes from "./relatorioRoutes.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

// ==========================================================
// 🧩 CONFIGURAÇÃO BÁSICA DE CORS (seguro e compatível)
// ==========================================================
// Garante que o frontend (Vite/React) possa acessar sem bloqueios
router.use(
  cors({
    origin: [
      "http://localhost:5173", // ambiente local
      process.env.FRONTEND_URL || "", // variável para produção
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==========================================================
// 🌐 Rotas básicas de diagnóstico e monitoramento
// ==========================================================
router.get("/", (_req, res) => {
  res.status(200).send("✅ Welcome to AcademiaFlow API!");
});

router.get("/ping", (_req, res) => {
  res.status(200).send("pong");
});

// 🔹 Endpoint simples de debug opcional (sem CORS crítico)
router.get("/logs", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Log endpoint active — use only for diagnostics.",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================================
// 🚀 Rotas principais da aplicação
// ==========================================================
// Cada módulo já contém seu prefixo base (/professor, /notas, /secretaria, etc.)
router.use("/api", professorRoutes);
router.use("/api", gradesRoutes);
router.use("/api", secretariaRoutes);
router.use("/api", relatorioRoutes);
router.use("/api", authRoutes);

// ==========================================================
// ⚠️ Tratamento genérico para rotas não encontradas (fallback seguro)
// ==========================================================
router.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found. Please verify your API route.",
  });
});

// ==========================================================
// 🔚 Exportação padrão
// ==========================================================
export default router;
