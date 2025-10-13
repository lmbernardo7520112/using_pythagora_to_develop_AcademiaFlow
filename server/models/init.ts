// server/models/init.ts
import Aluno from "./Aluno.js";
import Turma from "./Turma.js";
import Disciplina from "./Disciplina.ts"; // ✅ Adicionado

/**
 * Inicialização do modelo e pequenas migrações idempotentes.
 * - Garante que todos os alunos tenham os campos transferido/desistente
 * - Normaliza combinações de status para consistência com os cards
 */
export default async function dbInit() {
  // 1) Garantir flags com valores padrão em docs antigos
  await Aluno.updateMany(
    { transferido: { $exists: false } },
    { $set: { transferido: false } }
  );

  await Aluno.updateMany(
    { desistente: { $exists: false } },
    { $set: { desistente: false } }
  );

  // 2) Regras de normalização consistentes
  // 2.1) Se transferido = true OU desistente = true => ativo deve ser false
  await Aluno.updateMany(
    { $or: [{ transferido: true }, { desistente: true }], ativo: { $ne: false } },
    { $set: { ativo: false } }
  );

  // 2.2) Se ativo = true => transferido e desistente devem ser false
  await Aluno.updateMany(
    { ativo: true, $or: [{ transferido: true }, { desistente: true }] },
    { $set: { transferido: false, desistente: false } }
  );
}
