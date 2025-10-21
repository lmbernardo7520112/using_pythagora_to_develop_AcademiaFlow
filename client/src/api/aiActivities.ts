//client/src/api/aiActivities.ts

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/ai";

export const gerarAtividades = async (payload: any) => {
  const { data } = await axios.post(`${API_BASE}/gerarAtividade`, payload);
  return data;
};

export const listarAtividades = async (professorId: string) => {
  const { data } = await axios.get(`${API_BASE}/atividades/${professorId}`);
  return data.data;
};

export const revisarAtividade = async (id: string) => {
  const { data } = await axios.patch(`${API_BASE}/atividades/${id}/revisar`);
  return data;
};

export const excluirAtividade = async (id: string) => {
  const { data } = await axios.delete(`${API_BASE}/atividades/${id}`);
  return data;
};
