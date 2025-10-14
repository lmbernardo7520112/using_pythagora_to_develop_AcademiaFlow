//server/routes/authRoutes.ts
import express, { Request, Response } from "express";
import UserService from "../services/userService.js";
import { requireUser } from "./middlewares/auth.js";
import User, { IUser } from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/auth.js";
import jwt from "jsonwebtoken";
import { ALL_ROLES } from "shared";

const router = express.Router();

/**
 * Extensão segura de Request para incluir o campo `user` do tipo IUser
 */
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// ==========================================================
// 🔑 LOGIN
// ==========================================================
router.post("/login", async (req: Request, res: Response) => {
  const sendError = (msg: string) => res.status(400).json({ message: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError("Email and password are required");
  }

  const user = await UserService.authenticateWithPassword(email, password);

  if (!user) {
    return sendError("Email or password is incorrect");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Atualiza o refresh token com tipo seguro
  user.refreshToken = refreshToken ?? "";
  await user.save();

  return res.json({ ...user.toObject(), accessToken, refreshToken });
});

// ==========================================================
// 🧾 REGISTRO
// ==========================================================
router.post("/register", async (req: Request, res: Response) => {
  try {
    const user = await UserService.create(req.body);
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error while registering user: ${error}`);
    return res.status(400).json({ error });
  }
});

// ==========================================================
// 🚪 LOGOUT
// ==========================================================
router.post("/logout", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required for logout" });
  }

  const user = await User.findOne({ email });
  if (user) {
    user.refreshToken = ""; // garante compatibilidade com IUser
    await user.save();
  }

  res.status(200).json({ message: "User logged out successfully." });
});

// ==========================================================
// 🔁 REFRESH TOKEN
// ==========================================================
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("REFRESH_TOKEN_SECRET not defined");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload;

    const userId = decoded.sub as string;
    if (!userId) {
      return res.status(403).json({ success: false, message: "Invalid token payload" });
    }

    const user = await UserService.get(userId);
    if (!user) {
      return res.status(403).json({ success: false, message: "User not found" });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken ?? "";
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const name = error instanceof Error ? error.name : "UnknownError";

    console.error(`Token refresh error: ${message}`);

    if (name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Refresh token has expired",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
});

// ==========================================================
// 👤 PERFIL DO USUÁRIO ATUAL
// ==========================================================
router.get("/me", requireUser(ALL_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json(req.user);
});

// ==========================================================
// 👨‍🏫 LISTAR USUÁRIOS (com filtro opcional de role)
// Exemplo: GET /users?role=professor
// ==========================================================
router.get(
  "/users",
  requireUser(["secretaria", "admin", "administrador"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { role } = req.query;
      const query: any = {};

      if (role) query.role = role;

      const users = await User.find(query)
        .select("_id nome email role ativo")
        .sort({ nome: 1 })
        .lean();

      return res.status(200).json(users);
    } catch (err) {
      console.error("❌ authRoutes.get /users:", err);
      return res.status(500).json({ message: "Erro ao listar usuários" });
    }
  }
);

export default router;
