//server/routes/middlewares/auth.ts


import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ALL_ROLES } from "shared";
import UserService from "../../services/userService.js";
import { IUser } from "../../models/User.js";

/* ============================================================
   🔹 Tipagem adicional para Express.Request (segura)
============================================================ */
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser | jwt.JwtPayload | null;
    token?: string;
  }
}

/* ============================================================
   🔒 Middleware: requireUser
   ------------------------------------------------------------
   - Valida o token JWT presente em Authorization: Bearer <token>
   - Recupera o usuário correspondente no banco de dados
   - Verifica se ele pertence a um dos roles permitidos
   - Injeta req.user e req.token para uso em rotas protegidas
============================================================ */
const requireUser = (allowedRoles: string[] = ALL_ROLES) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("⚠️ Nenhum token JWT fornecido no cabeçalho Authorization.");
        return res.status(401).json({
          message: "Unauthorized: No token provided or invalid format.",
        });
      }

      // 🔹 Extrai o token
      const token = authHeader.split(" ")[1];
      req.token = token;

      if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET não definido nas variáveis de ambiente.");
        return res.status(500).json({
          message: "Internal Server Error: Missing JWT_SECRET.",
        });
      }

      // 🔹 Decodifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
      const userId = decoded.sub as string;

      if (!userId) {
        console.warn("⚠️ Token JWT válido, mas sem userId (sub).");
        return res.status(401).json({
          message: "Unauthorized: User ID not found in token.",
        });
      }

      // 🔹 Busca o usuário correspondente
      const user: IUser | null = await UserService.get(userId);
      if (!user) {
        console.warn(`⚠️ Usuário não encontrado para o ID ${userId}`);
        return res.status(401).json({
          message: "Unauthorized: User not found.",
        });
      }

      // 🔹 Verifica se o papel do usuário está autorizado
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.warn(
          `🚫 Acesso negado: Usuário ${user.email} (${user.role}) tentou acessar recurso restrito.`
        );
        return res.status(403).json({
          message: "Forbidden: Insufficient permissions.",
        });
      }

      // 🔹 Injeta dados na requisição
      req.user = user;

      console.log(
        `✅ [Auth] Usuário autenticado: ${user.nome || user.email} | Role: ${user.role}`
      );

      next();
    } catch (error) {
      console.error("❌ Erro durante a verificação do token JWT:", error);

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: "Unauthorized: Token expired.",
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({
          message: "Forbidden: Invalid or malformed token.",
        });
      }

      return res.status(500).json({
        message: "Internal Server Error during token verification.",
      });
    }
  };
};

export { requireUser };
