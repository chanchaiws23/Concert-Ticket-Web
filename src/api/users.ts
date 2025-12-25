import api from './axios';
import type { User } from '../types';

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  created_at: string;
  organizer_id: number | null;
  company_name: string | null;
}

export interface GetUsersQueryParams {
  page?: number;
  limit?: number;
  role?: 'USER' | 'ORGANIZER' | 'ADMIN';
  search?: string;
}

export interface GetUsersResponse {
  data: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
}

export interface UpdateUserResponse {
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}

/**
 * ดึงรายการ users ทั้งหมด (Admin only - ต้อง auth)
 * GET /users
 */
export const getUsers = async (params?: GetUsersQueryParams): Promise<GetUsersResponse> => {
  const response = await api.get<GetUsersResponse>('/users', { params });
  return response.data;
};

/**
 * ดึงข้อมูล user โดย ID (ต้อง auth)
 * GET /users/:id
 */
export const getUserById = async (id: number): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(`/users/${id}`);
  return response.data;
};

/**
 * อัปเดตข้อมูล user (Admin only - ต้อง auth)
 * PUT /users/:id
 */
export const updateUser = async (
  id: number,
  data: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  const response = await api.put<UpdateUserResponse>(`/users/${id}`, data);
  return response.data;
};

/**
 * ลบ user (Admin only - ต้อง auth)
 * DELETE /users/:id
 */
export const deleteUser = async (id: number): Promise<DeleteUserResponse> => {
  const response = await api.delete<DeleteUserResponse>(`/users/${id}`);
  return response.data;
};

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมด (Admin only - ต้อง auth)
 * GET /admin/users
 * @deprecated ใช้ getUsers แทน
 */
export const getAdminUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/users');
  return response.data;
};

/**
 * ลบผู้ใช้ (Admin only - ต้อง auth)
 * DELETE /admin/users/:id
 * @deprecated ใช้ deleteUser แทน
 */
export const deleteAdminUser = async (id: number): Promise<DeleteUserResponse> => {
  const response = await api.delete<DeleteUserResponse>(`/admin/users/${id}`);
  return response.data;
};

