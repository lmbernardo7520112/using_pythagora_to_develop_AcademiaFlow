//client/src/api/auth.ts

import api from './api';
import { AxiosError } from 'axios';

// Description: Login user functionality
// Endpoint: POST /auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Login error:', axiosError);
    throw new Error((axiosError.response?.data as { message?: string })?.message || axiosError.message);
  }
};

// Description: Register user functionality
// Endpoint: POST /auth/register
// Request: { email: string, password: string }
// Response: { email: string }
export const register = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', {email, password});
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error((axiosError.response?.data as { message?: string })?.message || axiosError.message);
  }
};

// Description: Logout
// Endpoint: POST /auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/auth/logout');
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error((axiosError.response?.data as { message?: string })?.message || axiosError.message);
  }
};