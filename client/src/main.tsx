// client/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// =========================================================
// 🔐 CONFIGURAÇÃO GLOBAL DO AXIOS (integração com AuthContext)
// =========================================================
import axios from "axios";

// Permite que cookies e credenciais sejam enviados (para rotas seguras)
axios.defaults.withCredentials = true;

// Interceptor global: anexa automaticamente o token JWT do localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// 🚀 Inicialização principal do React
// =========================================================
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);


