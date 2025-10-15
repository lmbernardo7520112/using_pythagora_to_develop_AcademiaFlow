// server/routes/index.ts


import express from "express";

// ✅ Importações compatíveis com Node ESM (.js após build)
import professorRoutes from "./professorRoutes.js";
import gradesRoutes from "./gradesRoutes.js";
import secretariaRoutes from "./secretariaRoutes.js";
import relatorioRoutes from "./relatorioRoutes.js";

const router = express.Router();

// ==========================================================
// 🌐 Rotas básicas de diagnóstico
// ==========================================================
router.get("/", (_req, res) => {
  res.status(200).send("Welcome to AcademiaFlow API!");
});

router.get("/ping", (_req, res) => {
  res.status(200).send("pong");
});

// ==========================================================
// 🚀 Rotas principais da aplicação
// ==========================================================
// ⚠️ Cada módulo já contém seu prefixo base (/professor, /notas, /secretaria, etc.)
router.use("/api", professorRoutes);
router.use("/api", gradesRoutes);
router.use("/api", secretariaRoutes);
router.use("/api", relatorioRoutes);

// ==========================================================
// 🔚 Exportação padrão
// ==========================================================
export default router;
