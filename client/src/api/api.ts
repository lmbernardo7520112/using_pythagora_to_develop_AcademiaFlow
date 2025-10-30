//client/src/api/api.ts

// client/src/api/api.ts

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import JSONbig from "json-bigint";

// ==============================================
// 🔹 CONFIGURAÇÃO DINÂMICA DE ENDPOINT
// ==============================================
// Em desenvolvimento: usa proxy do Vite ("/api" → porta 3000)
// Em produção: usa variável de ambiente VITE_API_URL (ex: https://api.seusistema.com/api)
const baseURL =
  import.meta.env.MODE === "development"
    ? "/api"
    : import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "/api";

// ==============================================
// 🔹 CONFIGURAÇÃO DO AXIOS
// ==============================================
const localApi: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
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
// 🔹 FUNÇÃO AUXILIAR
// ==============================================
const isRefreshTokenEndpoint = (url: string): boolean =>
  url.includes("/auth/refresh");

// ==============================================
// 🔹 INTERCEPTORES DE REQUEST E RESPONSE
// ==============================================
const setupInterceptors = (apiInstance: AxiosInstance) => {
  // ----- REQUEST -----
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (!accessToken) accessToken = localStorage.getItem("accessToken");
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // ----- RESPONSE -----
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError): Promise<unknown> => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

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

          const response = await localApi.post(`/auth/refresh`, {
            refreshToken,
          });
          const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          } = response.data.data;

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          accessToken = newAccessToken;

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return localApi(originalRequest);
        } catch (err) {
          localStorage.clear();
          accessToken = null;
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Inicializa interceptores
setupInterceptors(localApi);

// ==============================================
// 🔹 API FINAL EXPORTADA (com tipagem completa)
// ==============================================
const api: AxiosInstance = {
  ...localApi,
  // ✅ Garantimos suporte completo aos métodos Axios padrão
  get: localApi.get.bind(localApi),
  post: localApi.post.bind(localApi),
  put: localApi.put.bind(localApi),
  patch: localApi.patch.bind(localApi),
  delete: localApi.delete.bind(localApi),
  request: localApi.request.bind(localApi),
} as AxiosInstance;

export default api;
