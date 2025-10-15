// client/src/components/Sidebar.tsx


import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BarChart3,
} from "lucide-react";

/**
 * 🎯 Sidebar dinâmica por perfil (professor / secretaria)
 * A opção "Alunos" foi removida — os alunos agora são acessados via "Turmas".
 */
export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const role = currentUser?.role ?? "guest";

  // 🔹 Define os itens do menu de acordo com o perfil
  const menuItems =
    role === "professor"
      ? [
          { label: "Dashboard", path: "/", icon: LayoutDashboard },
          { label: "Minhas Disciplinas", path: "/", icon: BookOpen },
        ]
      : role === "secretaria" || role === "admin" || role === "administrador"
      ? [
          { label: "Dashboard", path: "/secretaria", icon: LayoutDashboard },
          { label: "Turmas", path: "/secretaria/turmas", icon: GraduationCap },
          { label: "Relatórios", path: "/secretaria/relatorios", icon: BarChart3 },
        ]
      : [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-card text-card-foreground border-r border-border flex flex-col justify-between">
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">
          {role === "secretaria" || role === "admin" || role === "administrador"
            ? "Painel da Secretaria"
            : role === "professor"
            ? "Painel do Professor"
            : "Painel"}
        </h2>

        <nav className="mt-4 flex flex-col space-y-1">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-sm mb-2 text-muted-foreground truncate">
          {currentUser?.email}
        </div>
        <Button
          variant="destructive"
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
}
