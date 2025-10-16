//server/models/Alunos.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAluno extends Document {
  nome: string;
  matricula: string;
  email: string;
  turma: mongoose.Types.ObjectId;
  ativo: boolean;
  transferido: boolean;
  desistente: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 🎓 Esquema do Aluno — mantido completo, com validações, auditoria e índices otimizados.
 * Esta versão remove índices duplicados, preservando totalmente as funcionalidades existentes.
 */
const AlunoSchema = new Schema<IAluno>(
  {
    nome: { type: String, required: true, trim: true },
    matricula: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    turma: { type: Schema.Types.ObjectId, ref: "Turma", required: true },
    ativo: { type: Boolean, default: true },
    transferido: { type: Boolean, default: false },
    desistente: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Índices úteis
AlunoSchema.index({ turma: 1, nome: 1 });
AlunoSchema.index({ ativo: 1 });
AlunoSchema.index({ transferido: 1 });
AlunoSchema.index({ desistente: 1 });

const Aluno: Model<IAluno> =
  mongoose.models.Aluno || mongoose.model<IAluno>("Aluno", AlunoSchema);

export default Aluno;
