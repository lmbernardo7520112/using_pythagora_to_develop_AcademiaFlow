// server/seed/createDisciplinesSeed.ts

// server/seed/createDisciplinesSeed.ts

import mongoose from "mongoose";
import Disciplina from "../models/Disciplina.js";

async function run() {
  try {
    console.log("🚀 Iniciando criação das disciplinas padrão...\n");

    // 🔹 Conexão com o MongoDB
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/academia_flow_db";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB\n");

    // 🔹 Lista completa de disciplinas definidas por você
    const defaultDisciplines = [
      "Biologia",
      "Matemática",
      "Química",
      "Geografia",
      "Sociologia",
      "História",
      "Filosofia",
      "Espanhol",
      "Português",
      "Artes",
      "Educação Física",
      "Inglês",
    ];

    for (const nome of defaultDisciplines) {
      const exists = await Disciplina.findOne({ nome });

      if (!exists) {
        // ✅ Geração do código sem acentos, compatível com regex do schema
        const codigo = nome
          .normalize("NFD") // separa acentos
          .replace(/[\u0300-\u036f]/g, "") // remove acentos
          .toUpperCase()
          .replace(/\s+/g, "_"); // substitui espaços por "_"

        await Disciplina.create({
          nome,
          codigo,
          professor: null, // sem professor vinculado inicialmente
          turma: null,     // sem turma inicial
          cargaHoraria: 60,
          ativo: true,
        });

        console.log(`✅ Disciplina criada: ${nome}`);
      } else {
        console.log(`⏭️ Disciplina já existente: ${nome}`);
      }
    }

    console.log("\n🎉 Todas as disciplinas padrão criadas/validadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar disciplinas:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão encerrada com MongoDB.");
    process.exit(0);
  }
}

run();
