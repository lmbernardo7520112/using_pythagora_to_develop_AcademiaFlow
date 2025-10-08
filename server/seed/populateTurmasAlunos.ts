// server/seed/populateTurmasAlunos.ts
import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';

// ⚠️ Importações devem terminar com .js para ESM funcionar corretamente
import { Aluno } from '../models/Aluno.js';
import { Turma } from '../models/Turma.js';
import { Disciplina } from '../models/Disciplina.js';
import { Nota } from '../models/Nota.js';
import User from '../models/User.js';

async function run() {
  try {
    // 🔹 Conexão com MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/academia_flow_db';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // 🔹 Caminho para o JSON
    const jsonPath = path.resolve('./turmas_alunos.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`❌ Arquivo não encontrado em: ${jsonPath}`);
    }

    // 🔹 Carregar JSON
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 🔹 Buscar professor existente
    const professor = await User.findOne({ role: 'professor' });
    if (!professor) throw new Error('❌ Nenhum professor encontrado no sistema.');

    // 🔹 Buscar disciplina Física
    const disciplina = await Disciplina.findOne({ nome: /Física/i });
    if (!disciplina) throw new Error('❌ Disciplina "Física" não encontrada.');

    // 🔹 Iterar sobre turmas do arquivo
    for (const turmaData of data.turmas) {
      const { nome_turma, alunos } = turmaData;
      const ano = 2025;

      // Criar turma se não existir
      let turma = await Turma.findOne({ nome: nome_turma, ano });
      if (!turma) {
        turma = await Turma.create({
          nome: nome_turma,
          ano,
          professor: professor._id,
          disciplinas: [disciplina._id],
          alunos: [],
          ativo: true,
        });
        console.log(`📘 Turma criada: ${nome_turma}`);
      }

      // Inserir alunos
      for (const aluno of alunos) {
        const matricula = `${nome_turma.replace(/\s+/g, '')}-${aluno.numero}`.toUpperCase();
        const email = `${aluno.nome.toLowerCase().replace(/\s+/g, '.')}@escola.com`;

        let alunoDoc = await Aluno.findOne({ matricula });
        if (!alunoDoc) {
          alunoDoc = await Aluno.create({
            nome: aluno.nome,
            matricula,
            email,
            turma: turma._id,
          });
          console.log(`👩‍🎓 Aluno inserido: ${aluno.nome}`);
        }

        const alunoId = alunoDoc._id as mongoose.Types.ObjectId;

        // Vincular aluno à turma (sem duplicar)
        if (!turma.alunos.some((id) => id.equals(alunoId))) {
          turma.alunos.push(alunoId);
        }

        // Criar registro de Nota se não existir
        const existsNota = await Nota.findOne({
          alunoId: alunoId,
          disciplineId: disciplina._id,
          turmaId: turma._id,
        });

        if (!existsNota) {
          await Nota.create({
            alunoId: alunoId,
            disciplinaId: disciplina._id,
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
            situacao: 'Pendente',
          });
          console.log(`📝 Nota inicial criada para ${aluno.nome}`);
        }
      }

      await turma.save();
    }

    console.log('\n🎉 Seed finalizado com sucesso!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();

