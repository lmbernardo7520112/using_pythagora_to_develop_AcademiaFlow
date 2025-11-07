// ==========================================================
// 📁 server/models/Disciplina.ts
// ----------------------------------------------------------
// Modelo de Disciplina — versão final sem warnings e 100% compatível
// ==========================================================

import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IDisciplina extends Document {
  nome: string;
  codigo: string;
  professor?: Types.ObjectId | null; // pode ser null
  turma?: Types.ObjectId | null;     // pode ser null
  cargaHoraria: number;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const DisciplinaSchema = new Schema<IDisciplina>(
  {
    nome: {
      type: String,
      required: [true, "Nome da disciplina é obrigatório"],
      trim: true,
      maxlength: [100, "Nome da disciplina não pode exceder 100 caracteres"],
    },
    codigo: {
      type: String,
      required: [true, "Código da disciplina é obrigatório"],
      unique: true, // cria automaticamente o índice único
      uppercase: true,
      match: [/^[A-Z0-9_-]+$/, "Código deve conter apenas letras, números e traços"],
      // ❌ sem index: true (evita duplicação)
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      // ❌ sem index: true (índice manual abaixo)
    },
    turma: {
      type: Schema.Types.ObjectId,
      ref: "Turma",
      required: false,
      default: null,
      // ❌ sem index: true (índice manual abaixo)
    },
    cargaHoraria: {
      type: Number,
      required: true,
      default: 60,
      min: [10, "Carga horária mínima é 10h"],
      max: [400, "Carga horária máxima é 400h"],
    },
    ativo: {
      type: Boolean,
      default: true,
      // ❌ sem index: true (índice manual abaixo)
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
      transform: (_doc, ret) => {
        const r = ret as any;
        delete r.__v;
        return r;
      },
    },
  }
);

// ==========================================================
// 📌 Índices consolidados e seguros
// ==========================================================
// ⚠️ Removido índice duplicado de "codigo"
// Mongoose já cria o índice único automaticamente via unique:true
DisciplinaSchema.index({ nome: 1 });
DisciplinaSchema.index({ ativo: 1 });
DisciplinaSchema.index({ professor: 1 });
DisciplinaSchema.index({ turma: 1 });

// ==========================================================
// 🧩 Modelo
// ==========================================================
const Disciplina: Model<IDisciplina> =
  mongoose.models.Disciplina ||
  mongoose.model<IDisciplina>("Disciplina", DisciplinaSchema);

export default Disciplina;
export { Disciplina };
