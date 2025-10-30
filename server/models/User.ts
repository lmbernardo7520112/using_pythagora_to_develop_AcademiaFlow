import mongoose, { Document, Schema, Types } from "mongoose";
import { isPasswordHash } from "../utils/password.js";
import { randomUUID } from "crypto";
import { ROLES } from "shared";

/**
 * 🔹 Interface do Usuário (IUser)
 * Define a estrutura do documento de usuário no MongoDB.
 */
export interface IUser extends Document {
  _id: Types.ObjectId | string;
  nome: string; // ✅ Adicionado: nome completo do usuário
  email: string;
  password: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  role: (typeof ROLES)[keyof typeof ROLES];
  refreshToken: string;
}

/**
 * 🔹 Schema do Mongoose
 */
const schema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: isPasswordHash,
        message: "Invalid password hash format",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    refreshToken: {
      type: String,
      unique: true,
      index: true,
      default: () => randomUUID(),
    },
  },
  {
    versionKey: false,
    timestamps: false,
    toJSON: {
      transform: (
        _doc: mongoose.Document<unknown, any, IUser>,
        ret: Partial<IUser>
      ) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

/**
 * 🔹 Modelo do Usuário
 */
const User = mongoose.model<IUser>("User", schema);

export default User;
export { User };

