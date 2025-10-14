// server/routes/index.ts


// server/routes/index.ts

import express from "express";

// ✅ Importações ajustadas para o modo ESM + Node16
// (mesmo que o arquivo-fonte seja .ts, o Node buscará o .js após a transpilação)
import professorRoutes from "./professorRoutes.js";
import gradesRoutes from "./gradesRoutes.js";
import secretariaRoutes from "./secretariaRoutes.js";
import relatorioRoutes from "./relatorioRoutes.js";
import authRoutes from "./authRoutes.js";

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
// ⚠️ Todas as rotas internas já possuem prefixos (/professor, /notas, /secretaria, etc.)
router.use("/api", professorRoutes);
router.use("/api", gradesRoutes);
router.use("/api", secretariaRoutes);
router.use("/api", relatorioRoutes);
router.use("/api", authRoutes);

// ==========================================================
// 🔚 Exportação padrão
// ==========================================================
export default router;
