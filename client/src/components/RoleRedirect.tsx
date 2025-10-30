//client/src/components/RoleRedirect.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "professor":
      return <Navigate to="/professor" replace />;
    case "secretaria":
      return <Navigate to="/secretaria" replace />;
    case "coordenacao":
      return <Navigate to="/coordenacao" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
