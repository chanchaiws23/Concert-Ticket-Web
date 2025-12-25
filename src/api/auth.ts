import api from './axios';
import type { User } from '../types';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ORGANIZER';
  companyName?: string; // required if role is ORGANIZER
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
}

export interface RegisterResponse {
  message: string;
}

/**
 * สมัครสมาชิกใหม่
 * POST /auth/register
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

/**
 * เข้าสู่ระบบ
 * POST /auth/login
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};

