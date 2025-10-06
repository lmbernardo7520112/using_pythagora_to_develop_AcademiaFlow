//server/models/Alunos.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAluno extends Document {
  nome: string;
  matricula: string;
  email: string;
  turma: Types.ObjectId; // ref: 'Turma'
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const AlunoSchema = new Schema<IAluno>(
  {
    nome: {
      type: String,
      required: [true, 'Nome do aluno é obrigatório'],
      trim: true,
      maxlength: [150, 'Nome do aluno não pode exceder 150 caracteres'],
    },
    matricula: {
      type: String,
      required: [true, 'Número de matrícula é obrigatório'],
      unique: true,
      match: [/^[A-Z0-9_-]+$/, 'Matrícula deve conter apenas letras, números e traços'],
      uppercase: true,
      // Removido: index: true (desnecessário com unique: true)
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de e-mail inválido'],
    },
    turma: {
      type: Schema.Types.ObjectId,
      ref: 'Turma',
      required: [true, 'Turma é obrigatória'],
      index: true,
    },
    ativo: {
      type: Boolean,
      default: true,
      index: true,
    },
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
      createdAt: 'criadoEm',
      updatedAt: 'atualizadoEm',
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

// Removidas as linhas de índices duplicados

// Modelo
const Aluno = mongoose.model<IAluno>('Aluno', AlunoSchema);

export default Aluno;
export { Aluno };