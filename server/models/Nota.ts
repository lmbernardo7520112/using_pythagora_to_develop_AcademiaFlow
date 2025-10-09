//server/models/Nota.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IAluno } from './Aluno.js';
import { calculateGrade } from '../lib/gradeCalculations.js'; // módulo unificado e agora consistente

export interface INota extends Document {
  alunoId: mongoose.Types.ObjectId;
  disciplinaId: mongoose.Types.ObjectId;
  turmaId: mongoose.Types.ObjectId;
  notas: {
    avaliacao1?: number;
    avaliacao2?: number;
    avaliacao3?: number;
    avaliacao4?: number;
    pf?: number; // prova de recuperação / exame
    final?: number; // caso exista campo final explícito
    [key: string]: number | undefined;
  };
  media: number | null;
  situacao: 'Aprovado' | 'Reprovado' | 'Recuperação' | 'Pendente';
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para objetos obtidos com `.lean()`
export interface INotaLean {
  _id: mongoose.Types.ObjectId | string | any;
  alunoId: mongoose.Types.ObjectId | IAluno;
  disciplinaId: mongoose.Types.ObjectId;
  turmaId: mongoose.Types.ObjectId;
  notas: {
    avaliacao1?: number;
    avaliacao2?: number;
    avaliacao3?: number;
    avaliacao4?: number;
    pf?: number;
    final?: number;
    [key: string]: number | undefined;
  };
  media: number | null;
  situacao: 'Aprovado' | 'Reprovado' | 'Recuperação' | 'Pendente';
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notaSchema = new Schema<INota>(
  {
    alunoId: { type: Schema.Types.ObjectId, ref: 'Aluno', required: true },
    disciplinaId: { type: Schema.Types.ObjectId, ref: 'Disciplina', required: true },
    turmaId: { type: Schema.Types.ObjectId, ref: 'Turma', required: true },
    notas: {
      avaliacao1: { type: Number, min: 0, max: 10 },
      avaliacao2: { type: Number, min: 0, max: 10 },
      avaliacao3: { type: Number, min: 0, max: 10 },
      avaliacao4: { type: Number, min: 0, max: 10 },
      pf: { type: Number, min: 0, max: 10 },
      final: { type: Number, min: 0, max: 10 },
    },
    media: { type: Number, default: null },
    situacao: {
      type: String,
      enum: ['Aprovado', 'Reprovado', 'Recuperação', 'Pendente'],
      default: 'Pendente',
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// índice único composto para evitar duplicidade (aluno + disciplina + turma)
notaSchema.index({ alunoId: 1, disciplinaId: 1, turmaId: 1 }, { unique: true });

// Hook para calcular automaticamente antes de salvar
notaSchema.pre('save', function (next) {
  // 'this' é o documento
  const notasObj = (this as any).notas || {};
  const { media, situacao } = calculateGrade(notasObj);
  (this as any).media = media;
  (this as any).situacao = situacao;
  next();
});

export const Nota = mongoose.model<INota>('Nota', notaSchema);
