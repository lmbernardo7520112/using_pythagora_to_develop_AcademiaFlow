//client/src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { User } from "../../../shared/types/user";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  user: User | null; // ✅ Alias para compatibilidade global (Sidebar, ProtectedRoute, etc.)
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("accessToken");
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? (JSON.parse(userData) as User) : null;
  });

  /**
   * 🧠 Restaura sessão automaticamente ao recarregar o app
   * Garante que AuthContext volte com o mesmo estado após refresh
   */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData) as User;
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        console.info("[AuthContext] Sessão restaurada do localStorage:", parsed);
      } catch (err) {
        console.warn("[AuthContext] userData inválido no localStorage, limpando...");
        resetAuth();
      }
    } else {
      console.info("[AuthContext] Nenhum dado salvo, usuário não autenticado.");
      resetAuth();
    }
  }, []);

  /**
   * 🔹 Efetua login e armazena tokens e dados do usuário
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData as User);
      console.info("[AuthContext] Login concluído com sucesso.");
    } catch (error: unknown) {
      handleAuthError(error, "Login failed");
    }
  };

  /**
   * 🔹 Registra novo usuário e autentica imediatamente
   */
  const register = async (email: string, password: string) => {
    try {
      const response = await apiRegister(email, password);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData as User);
      console.info("[AuthContext] Registro concluído com sucesso.");
    } catch (error: unknown) {
      handleAuthError(error, "Registration failed");
    }
  };

  /**
   * 🔹 Faz logout completo (limpa storage e recarrega página)
   */
  const logout = () => {
    resetAuth();
    window.location.reload();
  };

  /**
   * 🔹 Reseta autenticação (localStorage e estado React)
   */
  const resetAuth = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  /**
   * 🔹 Define dados de autenticação e atualiza estado global
   */
  const setAuthData = (accessToken: string, refreshToken: string, userData: User) => {
    if (!accessToken && !refreshToken) {
      throw new Error("Neither refreshToken nor accessToken was returned.");
    }

    // ✅ Persistência unificada
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userData", JSON.stringify(userData));

    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  /**
   * 🔹 Tratamento padronizado de erros de autenticação
   */
  const handleAuthError = (error: unknown, defaultMsg: string): never => {
    resetAuth();
    let errorMessage = defaultMsg;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null && "message" in error) {
      errorMessage = (error as { message: string }).message;
    }
    console.error("[AuthContext] Erro de autenticação:", errorMessage);
    throw new Error(errorMessage);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser, // ✅ Alias compatível
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook seguro para consumir o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
