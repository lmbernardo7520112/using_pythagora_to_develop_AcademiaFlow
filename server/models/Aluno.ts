//server/models/Alunos.ts

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

/**
 * 🎓 Esquema do Aluno — mantido completo, com validações, auditoria e índices otimizados.
 * Esta versão remove índices duplicados, preservando totalmente as funcionalidades existentes.
 */
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
      index: true, // ✅ Mantido (consulta rápida por turma)
    },

    // ======== Campos de status do aluno ========
    ativo: {
      type: Boolean,
      default: true,
      // ❌ index removido daqui (duplicava)
    },
    transferido: {
      type: Boolean,
      default: false,
      // ❌ index removido daqui (duplicava)
    },
    desistente: {
      type: Boolean,
      default: false,
      // ❌ index removido daqui (duplicava)
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

/**
 * 📈 Índices otimizados
 * Mantém todos os índices necessários para desempenho e filtragem, sem duplicatas.
 */
AlunoSchema.index({ turma: 1, nome: 1 });       // Busca rápida por turma + nome
AlunoSchema.index({ ativo: 1 });                // Filtragem por status ativo
AlunoSchema.index({ transferido: 1 });          // Filtragem por alunos transferidos
AlunoSchema.index({ desistente: 1 });           // Filtragem por alunos desistentes

/**
 * 🧩 Middleware opcional: atualiza timestamp de modificação
 * (já coberto por timestamps, mas mantido por compatibilidade)
 */
AlunoSchema.pre("save", function (next) {
  this.atualizadoEm = new Date();
  next();
});

/**
 * 🔒 Evita redefinições em ambiente de hot-reload (como no dev com nodemon)
 */
const Aluno =
  mongoose.models.Aluno || mongoose.model<IAluno>("Aluno", AlunoSchema);

export default Aluno;
export { Aluno };
