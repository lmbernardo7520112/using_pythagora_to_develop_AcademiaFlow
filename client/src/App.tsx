//client/src/App.tsx


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

<<<<<<< HEAD
=======
// ✅ Fluxos da Secretaria
>>>>>>> feature/prd003-secretary-class-view-refactor
import SecretariaDashboard from "./pages/SecretariaDashboard";
import SecretariaTurmas from "./pages/SecretariaTurmas";
import SecretariaAlunos from "./pages/SecretariaAlunos";
import SecretariaRelatorios from "./pages/SecretariaRelatorios";
import { SecretariaDisciplinas } from "./pages/SecretariaDisciplinas";

<<<<<<< HEAD
=======
// ✅ Redirecionamento automático por role
>>>>>>> feature/prd003-secretary-class-view-refactor
import { RoleRedirect } from "./components/RoleRedirect";
import { Unauthorized } from "./pages/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Redirecionamento inicial */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleRedirect />
                </ProtectedRoute>
              }
            />

            {/* Rotas do Professor */}
            <Route
              path="/professor/*"
              element={
                <ProtectedRoute roles={["professor"]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Painel inicial do professor */}
              <Route index element={<ProfessorDashboard />} />

              {/* ✅ Rota de gerenciamento de notas corrigida */}
              <Route
                path="grades/:turmaId/:disciplinaId"
                element={<GradeManagement />}
              />
            </Route>

            {/* Rotas da Secretaria */}
            <Route
              path="/secretaria/*"
              element={
                <ProtectedRoute roles={["secretaria", "admin", "administrador"]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SecretariaDashboard />} />
              <Route path="turmas" element={<SecretariaTurmas />} />
              <Route path="turmas/:turmaId/alunos" element={<SecretariaAlunos />} />
              <Route path="disciplinas" element={<SecretariaDisciplinas />} />
              <Route path="relatorios" element={<SecretariaRelatorios />} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>

        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
