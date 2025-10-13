// server/seed/populateTurmasAlunos.ts
import mongoose, { Types } from "mongoose";
import fs from "node:fs";
import path from "node:path";

// ⚙️ Importações corrigidas — todas com export default
import Aluno from "../models/Aluno.js";
import Turma from "../models/Turma.js";
import Disciplina from "../models/Disciplina.ts";
import { Nota } from "../models/Nota.js";
import User from "../models/User.js";
import { IDisciplina } from "../models/Disciplina.ts"; // apenas para tipagem

// 🧩 Helper para garantir tipo ObjectId
const toObjectId = (id: any): Types.ObjectId => {
  if (id instanceof Types.ObjectId) return id;
  return new Types.ObjectId(id);
};

async function run() {
  try {
    console.log("🚀 Iniciando seed de turmas e alunos...\n");

    // 🔹 Conexão com MongoDB
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/academia_flow_db";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    // 🔹 Caminho do JSON
    const jsonPath = path.resolve("./server/seed/turmas_alunos.json");
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
    let disciplinaDoc = await Disciplina.findOne({ nome: /Física/i });

    if (!disciplinaDoc) {
      disciplinaDoc = await Disciplina.create({
        nome: "Física",
        codigo: "FIS-101",
        professor: toObjectId(professor._id),
        turma: null,
        cargaHoraria: 60,
        ativo: true,
      });
      console.log("⚠️ Disciplina 'Física' não encontrada — criada automaticamente.");
    } else {
      console.log(`📘 Disciplina encontrada: ${disciplinaDoc.nome}`);
    }

    const disciplinaId: Types.ObjectId = toObjectId(disciplinaDoc._id);

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
          disciplinas: [disciplinaId],
          alunos: [],
          ativo: true,
        });
        console.log(`✅ Turma criada: ${nome_turma}`);
      } else {
        // Se já existir, garantir que a disciplina Física está vinculada
        if (!turma.disciplinas.some((id) => id.equals(disciplinaId))) {
          turma.disciplinas.push(disciplinaId);
          console.log(`➕ Disciplina 'Física' vinculada à turma existente ${nome_turma}`);
        }
      }

      // Inserir alunos
      for (const aluno of alunos) {
        // Normalizar nome_turma (sem espaços e caracteres especiais)
        const cleanedNomeTurma = nome_turma.replace(/[^A-Za-z0-9-]/g, "").toUpperCase();
        const matricula = `${cleanedNomeTurma}-${aluno.numero}`;
        const email = `${aluno.nome.toLowerCase().replace(/\s+/g, ".")}@escola.com`;

        let alunoDoc = await Aluno.findOne({ matricula });
        if (!alunoDoc) {
          alunoDoc = await Aluno.create({
            nome: aluno.nome,
            matricula,
            email,
            turma: turma._id,
            ativo: true,
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
          disciplinaId,
          turmaId: turma._id,
        });

        if (!existsNota) {
          await Nota.create({
            alunoId,
            disciplinaId,
            turmaId: turma._id,
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
