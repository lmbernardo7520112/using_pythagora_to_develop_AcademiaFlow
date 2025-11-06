// server/seed/populateUsers.ts
// ✅ Script para popular usuários no banco de dados academia_flow_db
import "../models/init.js"; // Garantir registro de modelos Mongoose
import mongoose from "mongoose";
import User from "../models/User.js"; // Importe o modelo User, ajuste o path se necessário

async function run() {
  try {
    console.log("🚀 Iniciando seed de usuários...\n");

    // 🔹 Conexão com o banco MongoDB (use .env ou fallback)
    const MONGO_URI = process.env.DATABASE_URL || "mongodb://172.17.0.2:27017/academia_flow_db"; // Ajuste com IP do container se Docker
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB\n");

    // 🔹 Dados dos usuários (foco em nome, email, role; outros campos opcionais ou gerados)
    const usersData = [
      {
        nome: 'Leonardo Maximino Bernardo',
        email: 'lmbernardo752011@gmail.com',
        role: 'professor',
        // Outros campos opcionais do dado fornecido (incluídos para fidelidade, mas password hashed deve ser gerado novo se necessário)
        password: '$2b$10$MpMi0tZi6WH3tb5KcNgsJuv.GEc.hIjpSLW3I7YHcJIQ4xvz58uZW',
        isActive: true,
        createdAt: new Date('2025-10-05T14:15:08.602Z'),
        lastLoginAt: new Date('2025-11-03T11:38:33.119Z'),
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGUyN2Q2YzRkNzBmMWQzMTU5ZGE1MmEiLCJpYXQiOjE3NjIxNjk5MTMsImV4cCI6MTc2NDc2MTkxM30.DaLSi9h5pxyPEG-7vWVeAEeCnvS3u-lO30yD6-pmFuw',
      },
      {
        nome: 'Secretaria Escolar',
        email: 'secretaria@escola.com',
        role: 'secretaria',
        // Outros campos opcionais
        password: '$2b$10$AX4Lcx5u0XAU5EvPglG8Te2c/TKOKiySO.PzoAbotai4qT4yagMOu',
        isActive: true,
        createdAt: new Date('2025-10-10T17:40:45.325Z'),
        lastLoginAt: new Date('2025-11-03T12:09:56.467Z'),
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGU5NDUxZGRmNmU5MWYxYjljZTVmNDciLCJpYXQiOjE3NjIxNzE3OTYsImV4cCI6MTc2NDc2Mzc5Nn0.j1gmBymhpxNA2cQWDlV3A0ZpKgEkp74GVe7OWGS6rF4',
      },
      {
        nome: 'Coordenação Pedagógica',
        email: 'coordenacao@academiaflow.com',
        role: 'coordenacao',
        // Outros campos opcionais (note: 'ativo' renomeado para 'isActive' assumindo consistência no modelo)
        password: '$2b$10$hHN.BMN3k1IfC9Ue1vuDZOs6NUQyH3cODpBr7BVRrHHkCx/PF219S',
        isActive: true,
        createdAt: new Date('2025-10-29T19:39:19.830Z'),
        lastLoginAt: new Date('2025-11-03T11:56:09.688Z'),
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTAyNmQ2N2ZhODE5Zjk0NTBjZTVmNDciLCJpYXQiOjE3NjIxNzA5NjksImV4cCI6MTc2NDc2Mjk2OX0.542-6gtkkPqpcpcn1o6AAvZgdyq1b_NiKErMRs9YSf4',
      },
    ];

    // 🔹 Verificar se usuários já existem (evitar duplicatas por email)
    for (const userData of usersData) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️ Usuário com email '${userData.email}' já existe. Pulando...`);
        continue;
      }

      // ✅ Criar novo usuário
      const newUser = new User(userData);
      await newUser.save();
      console.log(`✅ Usuário '${userData.nome}' criado com role '${userData.role}'`);
    }

    console.log("\n🎉 Seed de usuários finalizado com sucesso!");
  } catch (err) {
    console.error("❌ Erro no seed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão encerrada com MongoDB.");
    process.exit(0);
  }
}

run();