// server/server.ts

import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { fileURLToPath } from "url";

// ✅ Imports com extensão .js (Node16 ESM)
import basicRoutes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/database.js";
import dbInit from "./models/init.js";

// ==========================================================
// TRATAMENTO GLOBAL DE ERROS NÃO CAPTURADOS
// ==========================================================
process.on("uncaughtException", (err: Error) => {
  console.error("🚨 Uncaught Exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("🚨 Unhandled Rejection:", reason);
  console.error(promise);
  process.exit(1);
});

// ==========================================================
// VARIÁVEIS DE AMBIENTE
// ==========================================================
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env file.");
  process.exit(1);
}

// ==========================================================
// EXPRESS APP
// ==========================================================
const app = express();
const port = process.env.PORT || 3000;

app.enable("json spaces");
app.enable("strict routing");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// ⬇️ MONTE AS ROTAS FORA DO startServer()
// ==========================================================

// 1️⃣ Rotas de autenticação (mantém /api/auth)
app.use("/api/auth", authRoutes);

// 2️⃣ Rotas principais (professor, secretaria, notas, relatórios).
//    O roteador `index.ts` já prefixa cada subrota com /api.
app.use("/", basicRoutes);

// 404 - Rota não encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Page not found" });
});

// 500 - Erro interno
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`💥 Application error: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
);

// ==========================================================
// FUNÇÃO PARA INICIAR O SERVIDOR (conexão DB + listen)
// ==========================================================
const startServer = async () => {
  try {
    await connectDB();
    await dbInit();

    console.log("✅ MongoDB connected and models initialized successfully!");

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error: any) {
    console.error(`❌ Failed to start server: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// ==========================================================
// SÓ INICIA SE EXECUTADO DIRETAMENTE
// ==========================================================
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  // Executado via `npx tsx server.ts`
  startServer();
}

export { app, startServer };
