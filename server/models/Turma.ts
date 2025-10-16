// server/models/Turma.ts


import "./Disciplina.js";
import mongoose, { Document, Schema, Types, Model } from "mongoose";

export interface ITurma extends Document {
  nome: string;
  ano: number;
  professor: Types.ObjectId;
  disciplinas: Types.ObjectId[];
  alunos: Types.ObjectId[];
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  qtdAlunos?: number;
}

const TurmaSchema = new Schema<ITurma>(
  {
    nome: {
      type: String,
      required: [true, "Nome da turma é obrigatório"],
      trim: true,
      maxlength: [100, "Nome da turma não pode exceder 100 caracteres"],
    },
    ano: {
      type: Number,
      required: [true, "Ano é obrigatório"],
      min: [2000, "Ano deve ser maior ou igual a 2000"],
      max: [2100, "Ano deve ser menor ou igual a 2100"],
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Professor responsável é obrigatório"],
      index: true,
    },
    disciplinas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Disciplina",
      },
    ],
    alunos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Aluno",
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
      createdAt: "criadoEm",
      updatedAt: "atualizadoEm",
    },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        if ("__v" in ret) delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Índices
TurmaSchema.index({ nome: 1, ano: 1 }, { unique: true });
TurmaSchema.index({ ano: -1 });

// Virtual: número de alunos
TurmaSchema.virtual("qtdAlunos").get(function (this: ITurma) {
  return this.alunos?.length || 0;
});

// Hook automático
TurmaSchema.pre("save", function (next) {
  this.atualizadoEm = new Date();
  next();
});

const Turma: Model<ITurma> =
  mongoose.models.Turma || mongoose.model<ITurma>("Turma", TurmaSchema);

export default Turma;
export { Turma };
