//client/src/api/api.ts

// client/src/api/api.ts

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig
} from "axios";
import JSONbig from "json-bigint";

// ==============================================
// CONFIGURAÇÃO DO AXIOS
// ==============================================
const localApi: AxiosInstance = axios.create({
  baseURL: "/api", // 🔹 importante: garante que vá para o proxy do Vite (porta 3000)
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data) => {
      try {
        return JSONbig.parse(data);
      } catch {
        return data;
      }
    },
  ],
});

let accessToken: string | null = null;

// ==============================================
// FUNÇÃO AUXILIAR
// ==============================================
const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes("/auth/refresh"); // Corrigido: removeu "/api" pois url é relativa (sem baseURL)
};

// ==============================================
// INTERCEPTORES
// ==============================================
const setupInterceptors = (apiInstance: AxiosInstance) => {
  // REQUEST ------------------------------------------------------
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (!accessToken) {
        accessToken = localStorage.getItem("accessToken");
      }
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

  // RESPONSE ------------------------------------------------------
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError): Promise<unknown> => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Se token expirou (401/403) e ainda não tentamos refresh
      if (
        error.response?.status &&
        [401, 403].includes(error.response.status) &&
        !originalRequest._retry &&
        originalRequest.url &&
        !isRefreshTokenEndpoint(originalRequest.url)
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available");

          const response = await localApi.post(`/auth/refresh`, { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Atualiza tokens no localStorage
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          accessToken = newAccessToken;

          // Atualiza header e refaz a requisição original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return localApi(originalRequest);
        } catch (err) {
          // Falhou ao renovar: limpa tokens e redireciona
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          accessToken = null;
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      // Outros erros
      return Promise.reject(error);
    }
  );
};

// Inicializa interceptores
setupInterceptors(localApi);

// ==============================================
// API FINAL EXPORTADA
// ==============================================
const api = {
  request: (config: AxiosRequestConfig) => localApi(config),
  get: (url: string, config?: AxiosRequestConfig) => localApi.get(url, config),
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    localApi.post(url, data, config),
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    localApi.put(url, data, config),
  delete: (url: string, config?: AxiosRequestConfig) => localApi.delete(url, config),
};

export default api;