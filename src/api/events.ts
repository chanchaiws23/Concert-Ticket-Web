import api from './axios';
import type { EventData } from '../types';

export interface CreateEventRequest {
  title: string;
  description: string;
  venue: string;
  eventDate: string; // ISO 8601 format
  posterUrl: string;
  ticketTypes: Array<{
    name: string;
    price: number;
    total_quantity: number;
  }>;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  venue?: string;
  eventDate?: string; // ISO 8601 format
  posterUrl?: string;
  ticketTypes?: Array<{
    id?: number; // optional, ถ้ามีคือแก้ไข, ถ้าไม่มีคือเพิ่มใหม่
    name: string;
    price: number;
    total_quantity: number;
  }>;
}

export interface CreateEventResponse {
  id: number;
  message: string;
}

export interface GetEventsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc';
}

/**
 * ดึงรายการงานคอนเสิร์ตทั้งหมด (Public - ไม่ต้อง auth)
 * GET /events
 */
export const getEvents = async (params?: GetEventsQueryParams): Promise<EventData[]> => {
  const response = await api.get<EventData[]>('/events', { params });
  return response.data;
};

/**
 * ดึงรายละเอียดงานคอนเสิร์ต (Public - ไม่ต้อง auth)
 * GET /events/:id
 */
export const getEventById = async (id: number): Promise<EventData> => {
  const response = await api.get<EventData>(`/events/${id}`);
  return response.data;
};

/**
 * สร้างงานคอนเสิร์ตใหม่ (Organizer only - ต้อง auth)
 * POST /events
 */
export const createEvent = async (data: CreateEventRequest): Promise<CreateEventResponse> => {
  const response = await api.post<CreateEventResponse>('/events', {
    ...data,
    eventDate: data.eventDate,
    ticketTypes: data.ticketTypes,
  });
  return response.data;
};

/**
 * ดึงรายการงานคอนเสิร์ตของ Organizer (Organizer only - ต้อง auth)
 * GET /organizer/events
 */
export const getOrganizerEvents = async (params?: {
  page?: number;
  limit?: number;
  status?: 'published' | 'draft';
}): Promise<EventData[]> => {
  const response = await api.get<EventData[]>('/organizer/events', { params });
  return response.data;
};

/**
 * แก้ไขงานคอนเสิร์ต (Organizer only - เฉพาะงานของตัวเอง - ต้อง auth)
 * PUT /organizer/events/:id
 */
export const updateOrganizerEvent = async (
  id: number,
  data: UpdateEventRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(`/organizer/events/${id}`, {
    ...data,
    eventDate: data.eventDate,
    ticketTypes: data.ticketTypes,
  });
  return response.data;
};

/**
 * ลบงานคอนเสิร์ต (Organizer only - เฉพาะงานของตัวเอง - ต้อง auth)
 * DELETE /organizer/events/:id
 */
export const deleteOrganizerEvent = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/organizer/events/${id}`);
  return response.data;
};

/**
 * ลบงานคอนเสิร์ต (Admin only - ลบได้ทุกงาน - ต้อง auth)
 * DELETE /admin/events/:id
 */
export const deleteAdminEvent = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/admin/events/${id}`);
  return response.data;
};

