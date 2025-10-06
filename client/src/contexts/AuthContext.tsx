//client/src/contexts/AuthContext.tsx

// client/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, SetStateAction } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { User } from "../../../shared/types/user";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("accessToken");
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData as User); // Adicionado 'as User' para clarificar o tipo
    } catch (error: unknown) { // Use 'unknown' para a captura do erro
      resetAuth();
      let errorMessage = 'Login failed';
      if (error instanceof Error) { // Verifica se é uma instância de Error
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) { // Verifica se é um objeto com 'message'
        errorMessage = (error as { message: string }).message;
      }
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiRegister(email, password);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData as User); // Adicionado 'as User' para clarificar o tipo
    } catch (error: unknown) { // Use 'unknown' para a captura do erro
      resetAuth();
      let errorMessage = 'Registration failed';
      if (error instanceof Error) { // Verifica se é uma instância de Error
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) { // Verifica se é um objeto com 'message'
        errorMessage = (error as { message: string }).message;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    resetAuth();
    window.location.reload();
  };

  const resetAuth = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // setAuthData também precisa de um pequeno ajuste no tipo de userData
  const setAuthData = (accessToken: string, refreshToken: string, userData: User) => { // Alterado SetStateAction<User | null> para User
    if (accessToken || refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userData", JSON.stringify(userData));
      setCurrentUser(userData); // setCurrentUser pode aceitar User ou null, então está ok
      setIsAuthenticated(true);
    } else {
      throw new Error('Neither refreshToken nor accessToken was returned.');
    }
  };

  return (
      <AuthContext.Provider value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout
      }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}