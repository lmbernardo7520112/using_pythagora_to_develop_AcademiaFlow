//client/src/api/api.ts


import axios from "axios";

// ============================================================
// 🔹 Instância principal do Axios
// ============================================================
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// 🧠 Interceptador de requisições
// ------------------------------------------------------------
// Adiciona automaticamente o token JWT salvo no localStorage.
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug opcional:
    // console.debug("[Axios] Requisição →", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("[Axios] Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// ============================================================
// 🧩 Interceptador de respostas
// ------------------------------------------------------------
// Lida com expiração de token ou erros 401.
// ============================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔁 Se token expirou, tenta refresh automático
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("Refresh token não encontrado");

        const refreshResponse = await axios.post("/api/auth/refresh", { refreshToken });
        const { accessToken: newToken } = refreshResponse.data;

        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn("[Axios] Falha ao renovar token:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    console.error("[Axios] Erro na resposta:", error);
    return Promise.reject(error);
  }
);

export default api;
