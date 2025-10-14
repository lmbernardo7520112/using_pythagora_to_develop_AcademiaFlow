//server/seed/assignDisciplinesToTurmas.ts

// ✅ Garantir registro de todos os modelos antes de qualquer query
import "../models/init.js";

import mongoose, { Types } from "mongoose";
import Turma from "../models/Turma.js";
import Disciplina from "../models/Disciplina.js";
import Aluno from "../models/Aluno.js";
import { Nota } from "../models/Nota.js";
import User from "../models/User.js";

const toObjectId = (id: any): Types.ObjectId => {
  if (id instanceof Types.ObjectId) return id;
  return new Types.ObjectId(id);
};

async function run() {
  try {
    console.log("🚀 Iniciando atribuição de disciplinas às turmas...\n");

    // 🔹 Conexão com o banco MongoDB
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/academia_flow_db";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB\n");

    // 🔹 Lista de disciplinas padrão
    const disciplinasNomes = [
      "Biologia",
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

    // 🔹 Buscar disciplinas existentes
    const disciplinas = await Disciplina.find({
      nome: { $in: disciplinasNomes },
    }).lean();

    if (!disciplinas.length)
      throw new Error("❌ Nenhuma disciplina padrão encontrada no banco.");

    // 🔹 Buscar turmas e popular alunos (sem .lean() para manter métodos do Mongoose)
    const turmas = await Turma.find().populate("alunos").exec();
    if (!turmas.length) throw new Error("❌ Nenhuma turma encontrada.");

    console.log(
      `📚 ${disciplinas.length} disciplinas serão atribuídas a ${turmas.length} turmas.`
    );

    // 🔹 Iterar sobre cada turma
    for (const turma of turmas) {
      console.log(`\n🏫 Turma: ${turma.nome} (${turma._id})`);

      for (const disc of disciplinas) {
        const disciplinaId = toObjectId(disc._id);

        // ✅ Vincular disciplina à turma (sem duplicar)
        if (!turma.disciplinas.some((id: Types.ObjectId) => id.equals(disciplinaId))) {
          turma.disciplinas.push(disciplinaId);
          console.log(`➕ Disciplina '${disc.nome}' vinculada à turma '${turma.nome}'`);
        }

        // ✅ Criar notas iniciais para todos os alunos
        for (const aluno of turma.alunos as any[]) {
          const alunoId = toObjectId(aluno._id);
          const alunoNome = (aluno as any).nome ?? "Aluno sem nome";

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
            console.log(`📝 Nota inicial criada para ${alunoNome} em ${disc.nome}`);
          }
        }
      }

      // ✅ Salvar turma com as novas disciplinas vinculadas
      await turma.save();
      console.log(
        `💾 Turma ${turma.nome} atualizada com ${turma.disciplinas.length} disciplinas.`
      );
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
