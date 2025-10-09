//server/routes/middlewares/auth.ts

// server/routes/middlewares/auth.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ALL_ROLES, ROLES } from "shared";
import UserService from "../../services/userService.js";
import { IUser } from "../../models/User.js";

// ===================================================
// TIPAGEM DO req.user
// ===================================================
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

// ===================================================
// MIDDLEWARE: requireUser
// ===================================================
const requireUser = (allowedRoles: string[] = ALL_ROLES) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided or invalid format." });
    }

    const token = authHeader.split(" ")[1];

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not defined.");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
      const userId = decoded.sub as string;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found in token." });
      }

      const user: IUser | null = await UserService.get(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found." });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions." });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token." });
      }
      return res
        .status(500)
        .json({ message: "Internal Server Error during token verification." });
    }
  };
};

export { requireUser };
