// server/routes/index.ts

import express from 'express';
// Não precisamos de Request, Response aqui, pois apenas configuramos o roteador

import professorRoutes from './professorRoutes.js';
import gradesRoutes from './gradesRoutes.js';
import secretariaRoutes from "./secretariaRoutes.js";

const router = express.Router();

// Root path response
router.get("/", (req: express.Request, res: express.Response) => { // Corrigido: Use express.Response para 'res'
  res.status(200).send("Welcome to Your Website!");
});

router.get("/ping", (req: express.Request, res: express.Response) => { // Corrigido: Use express.Response para 'res'
  res.status(200).send("pong");
});

// ==========================================================
// NOVAS ROTAS INTEGRADAS AQUI
// As rotas nos arquivos professorRoutes.ts e gradesRoutes.ts já têm o prefixo /api
// ==========================================================
router.use(professorRoutes);
router.use(gradesRoutes);
router.use(secretariaRoutes);
// ==========================================================

export default router;