// server/types/express.d.ts

/**
 * 🔹 Extensão global da interface Express.Request
 * Este arquivo adiciona as propriedades "user" e "token" ao objeto Request do Express,
 * garantindo que o TypeScript reconheça corretamente o tipo IUser e o token JWT
 * em qualquer rota ou middleware (ex: coordRoutes.ts, auth.ts, etc).
 *
 * ✅ Soluciona erros do tipo:
 *    - "Property 'user' does not exist on type 'Request'"
 *    - "Property 'token' does not exist on type 'Request'"
 *
 * ⚙️ Importante:
 *  - O caminho de importação de IUser deve apontar exatamente para o modelo do usuário.
 *  - Este arquivo deve estar incluído no build do TypeScript (veja o tsconfig.json).
 */

import { IUser } from "../models/User";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      /**
       * Usuário autenticado, injetado pelo middleware JWT (auth.ts)
       * - Presente apenas em rotas protegidas.
       * - Tipo definido a partir do modelo Mongoose IUser.
       */
      user?: IUser | JwtPayload | null;

      /**
       * Token JWT extraído do cabeçalho Authorization (Bearer)
       * - Presente apenas quando o header Authorization é enviado.
       * - Útil para logs, depuração e middleware de auditoria.
       */
      token?: string;
    }
  }
}

// Necessário exportar algo (mesmo vazio) para transformar o arquivo em módulo.
export {};
