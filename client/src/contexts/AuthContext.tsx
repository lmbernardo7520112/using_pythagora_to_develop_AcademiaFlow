//client/src/contexts/AuthContext.tsx


import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { User } from "../../../shared/types/user";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem("accessToken"));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? (JSON.parse(userData) as User) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  /* ============================================================
     🧠 Reidratação segura de sessão (persistência JWT)
  ============================================================ */
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        const parsed = JSON.parse(userData) as User;
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        console.log(
          "%c[AuthContext]%c Sessão restaurada do localStorage:",
          "color:#00bcd4;font-weight:bold",
          "color:gray",
          parsed
        );
      } else {
        console.info("[AuthContext] Nenhum dado salvo, usuário não autenticado.");
        resetAuth();
      }
    } catch (err) {
      console.warn("[AuthContext] Erro ao reidratar sessão, limpando dados...");
      resetAuth();
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData as User);
      console.log("%c[AuthContext]%c Login concluído com sucesso.", "color:#4caf50;font-weight:bold", "color:gray");
    } catch (error: unknown) {
      handleAuthError(error, "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRegister(email, password);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData as User);
      console.log("%c[AuthContext]%c Registro concluído com sucesso.", "color:#4caf50;font-weight:bold", "color:gray");
    } catch (error: unknown) {
      handleAuthError(error, "Falha no registro");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    resetAuth();
    window.location.href = "/login";
  };

  const resetAuth = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const setAuthData = (accessToken: string, refreshToken: string, userData: User) => {
    if (!accessToken && !refreshToken)
      throw new Error("Neither refreshToken nor accessToken was returned.");
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userData", JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleAuthError = (error: unknown, defaultMsg: string): never => {
    resetAuth();
    let errorMessage = defaultMsg;
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === "object" && error && "message" in error)
      errorMessage = (error as { message: string }).message;
    console.error(
      "%c[AuthContext]%c Erro de autenticação:",
      "color:#f44336;font-weight:bold",
      "color:gray",
      errorMessage
    );
    throw new Error(errorMessage);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}
