// server/models/ValidacaoPedagogica.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface de feedback individual sobre uma atividade gerada por IA.
 */
export interface IFeedback {
  atividadeId: mongoose.Types.ObjectId;
  comentario: string;
  qualidadeIA: number;
  data: Date;
}

/**
 * Registro agregado da validação pedagógica por professor e disciplina.
 */
export interface IValidacaoPedagogica extends Document {
  professorId: mongoose.Types.ObjectId;
  nomeProfessor: string;
  disciplinaId: mongoose.Types.ObjectId;
  nomeDisciplina: string;
  atividadesValidadas: number;
  ultimaValidacao: Date;
  feedbacks: IFeedback[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Subschema para feedbacks pedagógicos detalhados.
 */
const feedbackSchema = new Schema<IFeedback>(
  {
    atividadeId: { type: Schema.Types.ObjectId, ref: "AtividadeGerada", required: true },
    comentario: { type: String, default: "" },
    qualidadeIA: { type: Number, min: 0, max: 10, required: true },
    data: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Esquema principal — consolida as métricas pedagógicas do professor.
 */
const validacaoSchema = new Schema<IValidacaoPedagogica>(
  {
    professorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    nomeProfessor: { type: String, required: true, trim: true },
    disciplinaId: { type: Schema.Types.ObjectId, ref: "Disciplina", required: true },
    nomeDisciplina: { type: String, required: true, trim: true },
    atividadesValidadas: { type: Number, default: 0 },
    ultimaValidacao: { type: Date, default: null },
    feedbacks: { type: [feedbackSchema], default: [] },
  },
  { timestamps: true }
);

/**
 * Índices otimizados para consultas por professor/disciplina e análises pedagógicas.
 */
validacaoSchema.index({ professorId: 1, disciplinaId: 1 });
validacaoSchema.index({ "feedbacks.data": -1 });
validacaoSchema.index({ atividadesValidadas: -1 });

/**
 * Exportação do modelo.
 */
export const ValidacaoPedagogica: Model<IValidacaoPedagogica> =
  mongoose.models.ValidacaoPedagogica ||
  mongoose.model<IValidacaoPedagogica>("ValidacaoPedagogica", validacaoSchema);
