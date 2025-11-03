//server/models/Aluno.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAluno extends Document {
  nome: string;
  matricula: string;
  email: string;
  turma: mongoose.Types.ObjectId;
  ativo: boolean;
  transferido: boolean;
  abandono: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string; // 🔹 adiciona o campo opcional
}

/**
 * 🎓 Esquema do Aluno — atualizado com o campo "abandono" no lugar de "desistente".
 * Mantém total compatibilidade e integridade dos índices.
 */
const AlunoSchema = new Schema<IAluno>(
  {
    nome: { type: String, required: true, trim: true },
    matricula: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    turma: { type: Schema.Types.ObjectId, ref: "Turma", required: true },
    ativo: { type: Boolean, default: true },
    transferido: { type: Boolean, default: false },
    abandono: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Índices otimizados
AlunoSchema.index({ turma: 1, nome: 1 });
AlunoSchema.index({ ativo: 1 });
AlunoSchema.index({ transferido: 1 });
AlunoSchema.index({ abandono: 1 });

const Aluno: Model<IAluno> =
  mongoose.models.Aluno || mongoose.model<IAluno>("Aluno", AlunoSchema);

export default Aluno;