// server/models/Turma.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITurma extends Document {
  nome: string;
  ano: number;
  professor: Types.ObjectId; // ref: 'User'
  disciplinas: Types.ObjectId[]; // ref: 'Disciplina'
  alunos: Types.ObjectId[]; // ref: 'Aluno'
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const TurmaSchema = new Schema<ITurma>(
  {
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
    professor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Professor responsável é obrigatório'],
      index: true,
    },
    disciplinas: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Disciplina',
        required: [true, 'Pelo menos uma disciplina é obrigatória'],
      },
    ],
    alunos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Aluno',
        default: [],
      },
    ],
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
        // Evita erro de tipo com delete em propriedades não opcionais
        const r = ret as any;
        delete r.__v;
        return r;
      },
    },
  }
);

// 🔹 Índices
TurmaSchema.index({ nome: 1, ano: 1 }, { unique: true });
TurmaSchema.index({ professor: 1 });
TurmaSchema.index({ ano: -1 });

// 🔹 Virtual (útil em dashboards e relatórios)
TurmaSchema.virtual('qtdAlunos').get(function (this: ITurma) {
  return this.alunos?.length || 0;
});

const Turma = mongoose.model<ITurma>('Turma', TurmaSchema);
export default Turma;
export { Turma };

