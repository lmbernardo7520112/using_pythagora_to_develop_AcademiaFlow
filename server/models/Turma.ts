import mongoose, { Document, Schema } from 'mongoose';

export interface ITurma extends Document {
  nome: string;
  ano: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

const schema = new Schema<ITurma>({
  nome: {
    type: String,
    required: [true, 'Nome da turma é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome da turma não pode exceder 100 caracteres'],
  },
  ano: {
    type: Number,
    required: [true, 'Ano é obrigatório'],
    min: [2000, 'Ano deve ser maior ou igual a 2000'],
    max: [2100, 'Ano deve ser menor ou igual a 2100'],
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
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'criadoEm',
    updatedAt: 'atualizadoEm',
  },
});

// Índices
schema.index({ nome: 1, ano: 1 }, { unique: true });
schema.index({ ano: -1 });

const Turma = mongoose.model<ITurma>('Turma', schema);

export default Turma;
