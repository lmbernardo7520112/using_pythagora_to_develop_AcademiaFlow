// server/models/AtividadeGerada.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface de uma Atividade Gerada por IA
 * Inclui campos adicionais de revisão e explicações (anteriores/atuais)
 * para compatibilidade com os fluxos de validação e feedback docente.
 */
export interface IAtividadeGerada extends Document {
  professorId: mongoose.Types.ObjectId;
  disciplinaId: mongoose.Types.ObjectId;
  turmaId: mongoose.Types.ObjectId;
  atividades: {
    id: string;
    titulo: string;
    enunciado: string;
    tipo: string;
    alternativas: string[];
    resposta_correta: string;
    explicacao: string;
    nivel_dificuldade: string;
  }[];
  metadata: {
    disciplina: string;
    tema: string;
    gerado_por: string;
    timestamp: Date;
  };
  revisado: boolean;
  criadoEm: Date;
  atualizadoEm: Date;

  // 🔹 Campos adicionais para compatibilidade com feedback/validação
  explicacaoAnterior?: string; // salva o texto original gerado pela IA
  explicacaoAtualizada?: string; // salva a versão revisada pelo professor
  feedbackProfessor?: string; // observações do professor
  validado?: boolean;
  validadoEm?: Date;
}

const AtividadeGeradaSchema = new Schema<IAtividadeGerada>(
  {
    professorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    disciplinaId: { type: Schema.Types.ObjectId, ref: "Disciplina", required: true },
    turmaId: { type: Schema.Types.ObjectId, ref: "Turma", required: true },

    atividades: [
      {
        id: { type: String },
        titulo: { type: String },
        enunciado: { type: String },
        tipo: { type: String },
        alternativas: [{ type: String }],
        resposta_correta: { type: String },
        explicacao: { type: String },
        nivel_dificuldade: { type: String },
      },
    ],

    metadata: {
      disciplina: { type: String },
      tema: { type: String },
      gerado_por: { type: String },
      timestamp: { type: Date, default: Date.now },
    },

    revisado: { type: Boolean, default: false },

    // 🔹 Campos adicionais para revisão e feedback
    explicacaoAnterior: { type: String, default: "" },
    explicacaoAtualizada: { type: String, default: "" },
    feedbackProfessor: { type: String, default: "" },
    validado: { type: Boolean, default: false },
    validadoEm: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
  }
);

// 🔹 Índices para otimizar buscas pedagógicas e analíticas
AtividadeGeradaSchema.index({
  professorId: 1,
  disciplinaId: 1,
  turmaId: 1,
  "metadata.tema": 1,
});

// 🔹 Exporta o modelo
export const AtividadeGerada: Model<IAtividadeGerada> =
  mongoose.models.AtividadeGerada ||
  mongoose.model<IAtividadeGerada>("AtividadeGerada", AtividadeGeradaSchema);
