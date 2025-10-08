// server/seed/populateTurmasAlunos.ts
// server/seed/populateTurmasAlunos.ts
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

// ⚠️ Importações com extensão .js (necessário em ESM)
import { Aluno } from "../models/Aluno.js";
import { Turma } from "../models/Turma.js";
import { Disciplina } from "../models/Disciplina.js";
import { Nota } from "../models/Nota.js";
import User from "../models/User.js";

// 🧩 Helper para garantir tipo ObjectId
const toObjectId = (id: any): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id);

async function run() {
  try {
    console.log("🚀 Iniciando seed de turmas e alunos...\n");

    // 🔹 Conexão com MongoDB
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/academia_flow_db";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    // 🔹 Caminho do JSON
    const jsonPath = path.resolve("./turmas_alunos.json");
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`❌ Arquivo não encontrado: ${jsonPath}`);
    }

    // 🔹 Carregar JSON
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    // 🔹 Buscar professor existente
    const professor = await User.findOne({ role: "professor" });
    if (!professor) throw new Error("❌ Nenhum professor encontrado no sistema.");

    console.log(`👨‍🏫 Professor vinculado: ${professor.email}`);

    // 🔹 Buscar disciplina Física ou criar fallback
    let disciplina = await Disciplina.findOne({ nome: /Física/i });
    if (!disciplina) {
      disciplina = await Disciplina.create({
        nome: "Física",
        descricao: "Disciplina de fallback criada automaticamente.",
        cargaHoraria: 60,
      });
      console.log("⚠️ Disciplina 'Física' não encontrada — criada automaticamente.");
    } else {
      console.log(`📘 Disciplina encontrada: ${disciplina.nome}`);
    }

    // 🔹 Iterar sobre turmas
    for (const turmaData of data.turmas) {
      const { nome_turma, alunos } = turmaData;
      const ano = 2025;

      console.log(`\n🏫 Processando turma: ${nome_turma}`);

      // Criar turma se não existir
      let turma = await Turma.findOne({ nome: nome_turma, ano });
      if (!turma) {
        turma = await Turma.create({
          nome: nome_turma,
          ano,
          professor: toObjectId(professor._id),
          disciplinas: [toObjectId(disciplina._id)],
          alunos: [],
          ativo: true,
        });
        console.log(`✅ Turma criada: ${nome_turma}`);
      } else {
        // Se já existir, garantir que a disciplina Física está vinculada
        if (!turma.disciplinas.some((id) => id.equals(disciplina._id))) {
          turma.disciplinas.push(toObjectId(disciplina._id));
          console.log(`➕ Disciplina 'Física' vinculada à turma existente ${nome_turma}`);
        }
      }

      // Inserir alunos
      for (const aluno of alunos) {
        const matricula = `${nome_turma.replace(/\s+/g, "")}-${aluno.numero}`.toUpperCase();
        const email = `${aluno.nome.toLowerCase().replace(/\s+/g, ".")}@escola.com`;

        let alunoDoc = await Aluno.findOne({ matricula });
        if (!alunoDoc) {
          alunoDoc = await Aluno.create({
            nome: aluno.nome,
            matricula,
            email,
            turma: turma._id,
          });
          console.log(`👩‍🎓 Novo aluno inserido: ${aluno.nome}`);
        }

        const alunoId = toObjectId(alunoDoc._id);

        // Vincular aluno à turma (sem duplicar)
        if (!turma.alunos.some((id) => id.equals(alunoId))) {
          turma.alunos.push(alunoId);
        }

        // Criar registro de Nota se não existir
        const existsNota = await Nota.findOne({
          alunoId,
          disciplinaId: toObjectId(disciplina._id),
          turmaId: toObjectId(turma._id),
        });

        if (!existsNota) {
          await Nota.create({
            alunoId,
            disciplinaId: toObjectId(disciplina._id),
            turmaId: toObjectId(turma._id),
            notas: {
              avaliacao1: null,
              avaliacao2: null,
              avaliacao3: null,
              avaliacao4: null,
              pf: null,
              final: null,
            },
            media: null,
            situacao: "Pendente",
          });
          console.log(`📝 Nota inicial criada para ${aluno.nome}`);
        }
      }

      await turma.save();
      console.log(`💾 Turma ${nome_turma} salva com ${turma.alunos.length} alunos.`);
    }

    console.log("\n🎉 Seed finalizado com sucesso!");
  } catch (err) {
    console.error("❌ Erro no seed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão encerrada com MongoDB.");
    process.exit(0);
  }
}

run();
