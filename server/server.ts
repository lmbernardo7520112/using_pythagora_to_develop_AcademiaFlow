// server/server.ts


import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { fileURLToPath } from "url";

import basicRoutes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/database.js";
import dbInit from "./models/init.js";

// ==========================================================
// ERROS GLOBAIS
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
dotenv.config();
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL ausente no .env");
  process.exit(1);
}

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
// ROTAS
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/", basicRoutes);

// 404
app.use((req: Request, res: Response) => res.status(404).json({ error: "Page not found" }));

// 500
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`💥 Application error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
);

// ==========================================================
const startServer = async () => {
  try {
    await connectDB();
    await dbInit();
    console.log("✅ MongoDB conectado e modelos inicializados.");
    app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
  } catch (error: any) {
    console.error(`❌ Falha ao iniciar servidor: ${error.message}`);
    process.exit(1);
  }
};

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  startServer();
}

export { app, startServer };
