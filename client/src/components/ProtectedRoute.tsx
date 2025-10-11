//client/src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";

/**
 * 🔒 ProtectedRoute
 * Garante que apenas usuários autenticados (e opcionalmente com role específica)
 * acessem as rotas protegidas.
 */
export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 🔹 1️⃣ Bloqueia se não estiver autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔹 2️⃣ Bloqueia se role não for autorizada
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔹 3️⃣ Libera o acesso
  return <>{children}</>;
}
