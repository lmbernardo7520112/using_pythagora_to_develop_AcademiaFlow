//server/models/Nota.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IAluno } from './Aluno'; // Importe IAluno para a referência

export interface INota extends Document {
  alunoId: mongoose.Types.ObjectId;
  disciplinaId: mongoose.Types.ObjectId;
  turmaId: mongoose.Types.ObjectId;
  notas: {
    avaliacao1?: number;
    avaliacao2?: number;
    avaliacao3?: number;
    final?: number;
  };
  media: number;
  situacao: 'Aprovado' | 'Reprovado' | 'Recuperação' | 'Pendente';
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// NOVO: Interface para o objeto Nota após `.lean()`
// Ajustado o tipo de _id para ser mais flexível com o que .lean() pode retornar
export interface INotaLean {
  _id: mongoose.Types.ObjectId | string | any; // <--- Ajustado aqui! Pode ser ObjectId, string ou qualquer coisa que .lean() retorne
  alunoId: mongoose.Types.ObjectId | IAluno;
  disciplinaId: mongoose.Types.ObjectId;
  turmaId: mongoose.Types.ObjectId;
  notas: {
    avaliacao1?: number;
    avaliacao2?: number;
    avaliacao3?: number;
    final?: number;
  };
  media: number;
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
      final: { type: Number, min: 0, max: 10 },
    },
    media: { type: Number, default: 0 },
    situacao: {
      type: String,
      enum: ['Aprovado', 'Reprovado', 'Recuperação', 'Pendente'],
      default: 'Pendente',
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

notaSchema.pre('save', function (next) {
  const avaliacao = this.notas || {};
  const notasValidas = Object.values(avaliacao).filter((n) => typeof n === 'number');
  if (notasValidas.length > 0) {
    this.media = Number(
      (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2)
    );
    if (this.media >= 7) this.situacao = 'Aprovado';
    else if (this.media >= 5) this.situacao = 'Recuperação';
    else this.situacao = 'Reprovado';
  } else {
    this.situacao = 'Pendente';
  }
  next();
});

export const Nota = mongoose.model<INota>('Nota', notaSchema);