// server/server.ts
import dotenv from 'dotenv';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import basicRoutes from './routes/index';
import authRoutes from './routes/authRoutes';
import { connectDB } from './config/database';
import dbInit from './models/init';
import cors from 'cors';

// ==========================================================
// TRATAMENTO DE ERROS GLOBAIS DO NODE.JS
// Para capturar erros não tratados que podem ocorrer em qualquer lugar
// no processo Node.js (não apenas dentro do Express).
// ==========================================================
process.on('uncaughtException', (err: Error) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('🚨 Unhandled Rejection:', reason);
  console.error(promise);
  process.exit(1);
});
// ==========================================================

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is missing in .env file.");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.enable('json spaces');
app.enable('strict routing');

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await connectDB();
    await dbInit();

    console.log('✅ MongoDB connected successfully!');

    // ==========================================================
    // CONFIGURAÇÃO DAS ROTAS
    // ==========================================================
    // Rotas de autenticação (mantidas com o prefixo /api/auth)
    app.use('/api/auth', authRoutes);

    // Rotas básicas (incluindo as novas de professor e notas via index.ts)
    app.use(basicRoutes);
    // ==========================================================

    app.use((req: Request, res: Response) => {
      res.status(404).send("Page not found.");
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(`Unhandled application error: ${err.message}`);
      console.error(err.stack);
      res.status(500).send("There was an error serving your request.");
    });

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error: any) {
    console.error(`❌ Failed to start server: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();