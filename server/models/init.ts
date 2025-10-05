// server/models/init.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importa os modelos para registrar as coleções no Mongoose
import './User';
import './Turma';
import './Aluno';
import './Disciplina';
import './Nota';

dotenv.config();

/**
 * Inicializa o banco de dados e registra todos os modelos Mongoose.
 * Essa função garante que a conexão e os modelos estejam prontos
 * antes que o restante da aplicação (rotas, serviços, etc.) seja carregado.
 */
const dbInit = async (options: Record<string, unknown> = {}): Promise<void> => {
  const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/academia_flow_db?replicaSet=rs0';

  try {
    // Garante que a conexão ocorra apenas se ainda não estiver conectada
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUrl, options);
      console.log(`✅ Connected to MongoDB at ${mongoUrl}`);
    } else {
      console.log('ℹ️ Mongoose connection already established, skipping reconnect.');
    }

    console.log('✅ Modelos Mongoose inicializados: User, Turma, Aluno, Disciplina, Nota');

    // Monitora eventos da conexão para depuração e estabilidade
    mongoose.connection.on('error', (err: Error) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.info('🔁 MongoDB reconnected successfully');
    });

  } catch (err) {
    console.error(`❌ Error connecting to database ${mongoUrl}:`, err);
    throw err;
  }
};

export default dbInit;

