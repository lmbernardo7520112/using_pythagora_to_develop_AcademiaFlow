// client/src/App.tsx


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { BlankPage } from "./pages/BlankPage";
import { ProfessorDashboard } from "./pages/ProfessorDashboard";
import { GradeManagement } from "./pages/GradeManagement";

// ✅ Fluxos da Secretaria
import SecretariaDashboard from "./pages/SecretariaDashboard";
import SecretariaTurmas from "./pages/SecretariaTurmas";
import SecretariaAlunos from "./pages/SecretariaAlunos";
import SecretariaRelatorios from "./pages/SecretariaRelatorios";
import { SecretariaDisciplinas } from "./pages/SecretariaDisciplinas";

// ✅ Fluxo do Professor — IA Atividades
import { AiActivitiesDashboard } from "./pages/AiActivitiesDashboard";
import AIGeneratedActivities from "./pages/AIGeneratedActivities"; // 🔹 Visualização detalhada de atividades

// ✅ Fluxo da Coordenação Pedagógica
import CoordinationDashboard from "./pages/CoordinationDashboard";

// ✅ Redirecionamento automático por role
import { RoleRedirect } from "./components/RoleRedirect";

// ✅ Página de acesso negado
import { Unauthorized } from "./pages/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            {/* =====================================================
               🔹 ROTAS PÚBLICAS
               ===================================================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Redirecionamento inicial por role */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleRedirect />
                </ProtectedRoute>
              }
            />

            {/* =====================================================
               🔹 ROTAS DO PROFESSOR
               ===================================================== */}
            <Route
              path="/professor/*"
              element={
                <ProtectedRoute roles={["professor"]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Painel principal do professor */}
              <Route index element={<ProfessorDashboard />} />

              {/* ✅ Gerenciamento de notas */}
              <Route
                path="grades/:turmaId/:disciplinaId"
                element={<GradeManagement />}
              />

              {/* ✅ Painel de Atividades IA */}
              <Route path="atividades" element={<AiActivitiesDashboard />} />

              {/* ✅ Detalhe de Atividade IA */}
              <Route path="atividades/:id" element={<AIGeneratedActivities />} />
            </Route>

            {/* =====================================================
               🔹 ROTAS DA SECRETARIA
               ===================================================== */}
            <Route
              path="/secretaria/*"
              element={
                <ProtectedRoute roles={["secretaria", "admin", "administrador"]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Painel principal */}
              <Route index element={<SecretariaDashboard />} />

              {/* Turmas */}
              <Route path="turmas" element={<SecretariaTurmas />} />

              {/* Disciplinas */}
              <Route path="disciplinas" element={<SecretariaDisciplinas />} />

              {/* Alunos */}
              <Route path="turmas/:turmaId/alunos" element={<SecretariaAlunos />} />

              {/* Relatórios acadêmicos */}
              <Route path="relatorios" element={<SecretariaRelatorios />} />
            </Route>

            {/* =====================================================
               🔹 ROTAS DA COORDENAÇÃO PEDAGÓGICA
               ===================================================== */}
            <Route
              path="/coordenacao/*"
              element={
                <ProtectedRoute roles={["coordenacao", "admin", "administrador"]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Painel principal da coordenação */}
              <Route index element={<CoordinationDashboard />} />
            </Route>

            {/* =====================================================
               🔹 OUTRAS ROTAS GERAIS
               ===================================================== */}

            {/* Página de acesso negado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Página genérica (404) */}
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>

        {/* 🔔 Sistema global de notificações */}
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
