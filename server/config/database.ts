// server/config/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL not set in environment');
    }

    // Conecta ao MongoDB (Replica Set habilitado)
    const conn = await mongoose.connect(DATABASE_URL);

    console.log(`✅ MongoDB Connected to ${conn.connection.host} (Replica Set: ${conn.connection.name})`);

    // Eventos de monitoramento e estabilidade
    mongoose.connection.on('error', (err: Error) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.info('🔁 MongoDB reconnected successfully');
    });

    // Encerramento limpo em caso de finalização do processo
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🧹 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
