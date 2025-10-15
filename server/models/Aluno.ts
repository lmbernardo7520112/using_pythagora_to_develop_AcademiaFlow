//server/models/Alunos.ts

// server/models/Aluno.ts

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAluno extends Document {
  nome: string;
  matricula: string;
  email: string;
  turma: Types.ObjectId;
  ativo: boolean;
  transferido: boolean;
  desistente: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const AlunoSchema = new Schema<IAluno>(
  {
    nome: {
      type: String,
      required: [true, "Nome do aluno é obrigatório"],
      trim: true,
      maxlength: [150, "Nome do aluno não pode exceder 150 caracteres"],
    },
    matricula: {
      type: String,
      required: [true, "Número de matrícula é obrigatório"],
      unique: true,
      match: [/^[A-Z0-9_-]+$/, "Matrícula deve conter apenas letras, números e traços"],
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, "E-mail é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de e-mail inválido"],
    },
    turma: {
      type: Schema.Types.ObjectId,
      ref: "Turma",
      required: [true, "Turma é obrigatória"],
      index: true,
    },

    // ======== Campos de status do aluno ========
    ativo: {
      type: Boolean,
      default: true,
      index: true,
    },
    transferido: {
      type: Boolean,
      default: false,
      index: true,
    },
    desistente: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ======== Campos de auditoria ========
    criadoEm: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    atualizadoEm: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "criadoEm",
      updatedAt: "atualizadoEm",
    },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const r = ret as any;
        delete r.__v;
        return r;
      },
    },
  }
);

// Índices úteis para consultas frequentes
AlunoSchema.index({ turma: 1, nome: 1 });
AlunoSchema.index({ ativo: 1 });
AlunoSchema.index({ transferido: 1 });
AlunoSchema.index({ desistente: 1 });

// Modelo compilado (evita redefinições em hot reload)
const Aluno =
  mongoose.models.Aluno || mongoose.model<IAluno>("Aluno", AlunoSchema);

export default Aluno;
export { Aluno };
