//server/models/Disciplinas.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDisciplina extends Document {
  nome: string;
  codigo: string;
  professor: Types.ObjectId; // ref: 'User'
  turma: Types.ObjectId;     // ref: 'Turma'
  cargaHoraria: number;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const DisciplinaSchema = new Schema<IDisciplina>(
  {
    nome: {
      type: String,
      required: [true, 'Nome da disciplina é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome da disciplina não pode exceder 100 caracteres'],
    },
    codigo: {
      type: String,
      required: [true, 'Código da disciplina é obrigatório'],
      unique: true,
      uppercase: true,
      match: [/^[A-Z0-9_-]+$/, 'Código deve conter apenas letras, números e traços'],
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Professor responsável é obrigatório'],
      index: true,
    },
    turma: {
      type: Schema.Types.ObjectId,
      ref: 'Turma',
      required: [true, 'Turma vinculada é obrigatória'],
      index: true,
    },
    cargaHoraria: {
      type: Number,
      required: true,
      default: 60,
      min: [10, 'Carga horária mínima é 10h'],
      max: [400, 'Carga horária máxima é 400h'],
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

// Índices úteis para consultas e consistência
DisciplinaSchema.index({ codigo: 1 }, { unique: true });
DisciplinaSchema.index({ professor: 1 });
DisciplinaSchema.index({ turma: 1 });

// Modelo
const Disciplina = mongoose.model<IDisciplina>('Disciplina', DisciplinaSchema);

export default Disciplina;
export { Disciplina };
