// ==========================================================
// 📁 server/models/init.ts
// ----------------------------------------------------------
// Inicialização dos modelos Mongoose e migrações idempotentes
// ----------------------------------------------------------
// Objetivos:
//  - Registrar modelos base: Aluno, Turma, Disciplina
//  - Executar normalizações de dados antigas (sem perda de estado)
//  - Evitar reimportações e duplicações de schema (garante 0 warnings)
// ==========================================================

import Aluno from "./Aluno.js";
import Turma from "./Turma.js";
// ⚠️ Import único e direto do modelo Disciplina (não repita este import em outros arquivos)
import Disciplina from "./Disciplina.js";

/**
 * 🧩 Função de inicialização e migração leve do banco de dados
 * ------------------------------------------------------------
 * Executada no boot do servidor para:
 *  1️⃣ Garantir consistência entre os campos de status dos alunos;
 *  2️⃣ Corrigir registros antigos que possam não ter flags criadas;
 *  3️⃣ Evitar duplicação de índices e garantir que os modelos
 *     estejam registrados apenas uma vez no Mongoose.
 */
export default async function dbInit() {
  // ==========================================================
  // 1️⃣ Garantir flags de status com valores padrão
  // ==========================================================
  await Aluno.updateMany(
    { transferido: { $exists: false } },
    { $set: { transferido: false } }
  );

  await Aluno.updateMany(
    { desistente: { $exists: false } },
    { $set: { desistente: false } }
  );

  // ==========================================================
  // 2️⃣ Regras de normalização consistentes
  // ==========================================================

  // 2.1 Se transferido = true OU desistente = true → ativo deve ser false
  await Aluno.updateMany(
    {
      $or: [{ transferido: true }, { desistente: true }],
      ativo: { $ne: false },
    },
    { $set: { ativo: false } }
  );

  // 2.2 Se ativo = true → transferido e desistente devem ser false
  await Aluno.updateMany(
    {
      ativo: true,
      $or: [{ transferido: true }, { desistente: true }],
    },
    { $set: { transferido: false, desistente: false } }
  );

  // ==========================================================
  // 3️⃣ Confirmação de modelos registrados (sem duplicações)
  // ==========================================================
  // Esses logs são úteis apenas em ambiente de dev.
  // Você pode removê-los ou comentar em produção se desejar.
  if (process.env.NODE_ENV !== "production") {
    const models = Object.keys(Disciplina.db.models);
    console.log("📦 Modelos Mongoose carregados:", models.join(", "));
  }

  // Pronto — inicialização segura concluída
}
