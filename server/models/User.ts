// server/models/User.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import { isPasswordHash } from '../utils/password.js';
import { randomUUID } from 'crypto';
import { ROLES } from 'shared'; // Importado corretamente de 'shared'

/**
 * 🔹 Interface do Usuário (IUser)
 * Define a estrutura de dados e garante tipagem consistente em todo o backend.
 */
export interface IUser extends Document {
  _id: Types.ObjectId | string;
  email: string;
  password: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  role:
    | typeof ROLES.ADMIN
    | typeof ROLES.USER
    | typeof ROLES.PROFESSOR
    | typeof ROLES.SECRETARIA
    | typeof ROLES.ADMINISTRADOR;
  refreshToken: string;
}

/**
 * 🔹 Schema do Mongoose
 */
const schema = new Schema<IUser>(
  {
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
        message: 'Invalid password hash format',
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
      /**
       * ✅ Correção da tipagem do transform
       * Essa assinatura segue o formato esperado pelo Mongoose 7+
       */
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
const User = mongoose.model<IUser>('User', schema);

export default User;
export { User };

