import api from './axios';
import type { Order } from '../types';

export interface PurchaseRequest {
  items: Array<{
    ticketTypeId: number;
    quantity: number;
  }>;
}

export interface PurchaseResponse {
  success: boolean;
  orderId: number;
  message: string;
}

export interface PurchaseErrorResponse {
  success: false;
  error: string;
}

/**
 * ซื้อบัตรคอนเสิร์ต (ต้อง auth)
 * POST /orders/purchase
 */
export const purchaseTickets = async (data: PurchaseRequest): Promise<PurchaseResponse> => {
  const response = await api.post<PurchaseResponse>('/orders/purchase', data);
  return response.data;
};

/**
 * ดึงคำสั่งซื้อของ User (ต้อง auth)
 * GET /orders/my-orders
 */
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/orders/my-orders');
  return response.data;
};

/**
 * ดึงรายละเอียดคำสั่งซื้อ (ต้อง auth - เฉพาะของตัวเอง)
 * GET /orders/:id
 */
export const getOrderById = async (id: number): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

/**
 * ดึงคำสั่งซื้อของงานที่ Organizer เป็นเจ้าของ (Organizer only - ต้อง auth)
 * GET /organizer/orders
 */
export const getOrganizerOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/organizer/orders');
  return response.data;
};

/**
 * ดึงคำสั่งซื้อทั้งหมด (Admin only - ต้อง auth)
 * GET /admin/orders
 */
export const getAdminOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/admin/orders');
  return response.data;
};

