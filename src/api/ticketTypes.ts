import api from './axios';
import type { TicketType } from '../types';

export interface TicketTypeResponse extends TicketType {
  event_id: number;
  created_at: string;
  event_title?: string;
  organizer_id?: number;
}

export interface GetTicketTypesQueryParams {
  page?: number;
  limit?: number;
  eventId?: number;
  search?: string;
}

export interface GetTicketTypesResponse {
  data: TicketTypeResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTicketTypeRequest {
  eventId: number;
  name: string;
  price: number;
  totalQuantity: number;
}

export interface CreateTicketTypeResponse {
  id: number;
  event_id: number;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  created_at: string;
}

export interface UpdateTicketTypeRequest {
  name: string;
  price: number;
  totalQuantity: number;
}

export interface UpdateTicketTypeResponse {
  id: number;
  event_id: number;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  created_at: string;
}

export interface DeleteTicketTypeResponse {
  message: string;
}

/**
 * ดึงรายการ ticket types ทั้งหมด (ต้อง auth)
 * GET /ticket-types
 */
export const getTicketTypes = async (
  params?: GetTicketTypesQueryParams
): Promise<GetTicketTypesResponse> => {
  const response = await api.get<GetTicketTypesResponse>('/ticket-types', { params });
  return response.data;
};

/**
 * ดึงข้อมูล ticket type โดย ID (ต้อง auth)
 * GET /ticket-types/:id
 */
export const getTicketTypeById = async (id: number): Promise<TicketTypeResponse> => {
  const response = await api.get<TicketTypeResponse>(`/ticket-types/${id}`);
  return response.data;
};

/**
 * สร้าง ticket type ใหม่ (Organizer/Admin only - ต้อง auth)
 * POST /ticket-types
 */
export const createTicketType = async (
  data: CreateTicketTypeRequest
): Promise<CreateTicketTypeResponse> => {
  const response = await api.post<CreateTicketTypeResponse>('/ticket-types', data);
  return response.data;
};

/**
 * อัปเดต ticket type (Organizer/Admin only - ต้อง auth)
 * PUT /ticket-types/:id
 */
export const updateTicketType = async (
  id: number,
  data: UpdateTicketTypeRequest
): Promise<UpdateTicketTypeResponse> => {
  const response = await api.put<UpdateTicketTypeResponse>(`/ticket-types/${id}`, data);
  return response.data;
};

/**
 * ลบ ticket type (Organizer/Admin only - ต้อง auth)
 * DELETE /ticket-types/:id
 */
export const deleteTicketType = async (id: number): Promise<DeleteTicketTypeResponse> => {
  const response = await api.delete<DeleteTicketTypeResponse>(`/ticket-types/${id}`);
  return response.data;
};

