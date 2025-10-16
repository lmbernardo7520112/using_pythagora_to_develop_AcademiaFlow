// client/src/components/Sidebar.tsx

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  LogOut,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  BarChart3,
} from "lucide-react";

interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const role = currentUser?.role ?? "guest";

  // =====================================================
  // ✅ MENUS BASEADOS NO PAPEL (ROLE)
  // =====================================================
  const menuItems: MenuItem[] =
    role === "professor"
      ? [
          {
            key: "professor-dashboard",
            label: "Dashboard",
            path: "/professor",
            icon: LayoutDashboard,
          },
          {
            key: "professor-disciplines",
            label: "Minhas Disciplinas",
            path: "/professor/disciplinas",
            icon: BookOpen,
          },
        ]
      : role === "secretaria" || role === "admin" || role === "administrador"
      ? [
          {
            key: "secretaria-dashboard",
            label: "Dashboard",
            path: "/secretaria",
            icon: LayoutDashboard,
          },
          {
            key: "secretaria-turmas",
            label: "Turmas",
            path: "/secretaria/turmas",
            icon: GraduationCap,
          },
          {
            key: "secretaria-disciplinas",
            label: "Disciplinas",
            path: "/secretaria/disciplinas",
            icon: BookOpen,
          },
          {
            key: "secretaria-relatorios",
            label: "Relatórios",
            path: "/secretaria/relatorios",
            icon: BarChart3,
          },
        ]
      : [];

  // =====================================================
  // ✅ LOGOUT
  // =====================================================
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =====================================================
  // ✅ RENDERIZAÇÃO
  // =====================================================
  return (
    <aside className="w-64 bg-card text-card-foreground border-r border-border flex flex-col justify-between">
      {/* Topo */}
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">
          {role === "secretaria" || role === "admin" || role === "administrador"
            ? "Painel da Secretaria"
            : role === "professor"
            ? "Painel do Professor"
            : "Painel"}
        </h2>

        <nav className="mt-4 flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`
                }
                end
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Rodapé */}
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
