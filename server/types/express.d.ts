// server/types/express.d.ts

/**
 * 🔹 Extensão global da interface Express.Request
 * Este arquivo adiciona a propriedade "user" ao objeto Request do Express,
 * garantindo que o TypeScript reconheça corretamente o tipo IUser em qualquer rota ou middleware.
 *
 * ✅ Soluciona erros do tipo:
 *    "Object is of type 'unknown'" em req.user!._id ou req.user!.role
 *
 * ⚙️ Importante:
 *  - O caminho de importação de IUser deve apontar exatamente para o modelo do usuário.
 *  - Este arquivo deve estar incluído no build do TypeScript (veja abaixo em "Configuração do tsconfig.json").
 */

import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      /**
       * Usuário autenticado, injetado pelo middleware JWT (auth.ts)
       * - Presente apenas em rotas protegidas.
       * - Tipo definido a partir do modelo Mongoose IUser.
       */
      user?: IUser | null;
    }
  }
}

// Necessário exportar algo (mesmo vazio) para transformar o arquivo em módulo.
export {};
