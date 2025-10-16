// server/seed/assignRandomGradesSeed.ts

import mongoose from "mongoose";
import { Nota } from "../models/Nota.js";
import Aluno from "../models/Aluno.js";
import Disciplina from "../models/Disciplina.js";
import Turma from "../models/Turma.js";

async function run() {
  try {
    console.log("🎯 Iniciando seed de atribuição aleatória de notas...\n");

    // 🔹 Conexão com MongoDB
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/academia_flow_db";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB\n");

    // 🔹 Buscar todas as notas existentes
    const notas = await Nota.find()
      .populate("alunoId", "nome")
      .populate("disciplinaId", "nome")
      .populate("turmaId", "nome")
      .exec();

    if (!notas.length) {
      console.log("⚠️ Nenhum registro de nota encontrado. Execute o seed de atribuição antes.");
      return;
    }

    const randomScore = () => parseFloat((Math.random() * 9 + 1).toFixed(1));

    let updatedCount = 0;

    // 🔹 Iterar sobre cada nota e preencher apenas os campos nulos
    for (const notaDoc of notas) {
      const { notas: n } = notaDoc;
      let updated = false;

      ["avaliacao1", "avaliacao2", "avaliacao3", "avaliacao4"].forEach((campo) => {
        if (n[campo] == null) {
          n[campo] = randomScore();
          updated = true;
        }
      });

      // 🔹 Atualizar somente se houve alteração
      if (updated) {
        await notaDoc.save(); // o hook pre('save') recalcula media e situacao
        updatedCount++;

        const alunoNome =
          (notaDoc as any).alunoId?.nome || "Aluno desconhecido";
        const disciplinaNome =
          (notaDoc as any).disciplinaId?.nome || "Disciplina desconhecida";
        console.log(
          `📝 Notas atualizadas para ${alunoNome} em ${disciplinaNome}.`
        );
      }
    }

    console.log(
      `\n✅ Processo concluído: ${updatedCount} registros de nota atualizados.`
    );
  } catch (err) {
    console.error("❌ Erro ao atribuir notas aleatórias:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão encerrada com MongoDB.");
    process.exit(0);
  }
}

run();
