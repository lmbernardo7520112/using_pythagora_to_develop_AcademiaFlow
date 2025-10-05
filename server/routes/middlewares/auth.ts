//server/routes/middlewares/auth.ts

import UserService from '../../services/userService';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// CORRIGIDO: Usando o import exato que você tem para ROLES
import { ALL_ROLES, ROLES } from 'shared';
// Importando IUser do seu modelo User.ts
import { IUser } from '../../models/User';

// -------------------------------------------------------------
// CORREÇÃO: Extensão da interface Request para tipagem de req.user
// Agora, req.user será tipado como IUser, diretamente do seu modelo.
// Isso permite acessar `req.user._id`, `req.user.role`, etc., diretamente
// sem precisar de `(req as any)`.
// -------------------------------------------------------------
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser; // <--- req.user tipado como a interface do seu modelo Mongoose
  }
}

const requireUser = (allowedRoles: string[] = ALL_ROLES) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided or invalid format.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      if (!process.env.JWT_SECRET) {
        // Esta verificação deve idealmente ser feita na inicialização do server.ts
        // para falhar cedo, mas é mantida aqui por segurança.
        throw new Error('JWT_SECRET environment variable is not defined.');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

      // Seu UserService.get espera um string para o ID.
      // O 'sub' do JWT é comumente o ID do usuário.
      const userId = decoded.sub as string;
      if (!userId) {
          return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
      }

      // Busca o usuário no banco de dados para garantir que ele existe e obter a role atualizada
      // UserService.get é um método estático, então chamamos diretamente na classe
      const user: IUser | null = await UserService.get(userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found.' });
      }

      // Se roles são especificadas, verifica se o usuário tem uma das roles permitidas
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      req.user = user; // O objeto completo do usuário (IUser) é anexado à requisição
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
      }
      // Captura outros erros inesperados durante a verificação
      return res.status(500).json({ message: 'Internal Server Error during token verification.' });
    }
  };
};

export {
  requireUser,
};