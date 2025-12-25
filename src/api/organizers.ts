import api from './axios';

export interface OrganizerResponse {
  id: number;
  user_id: number;
  company_name: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface GetOrganizersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetOrganizersResponse {
  data: OrganizerResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateOrganizerRequest {
  userId: number;
  companyName: string;
}

export interface CreateOrganizerResponse {
  id: number;
  user_id: number;
  company_name: string;
  created_at: string;
}

export interface UpdateOrganizerRequest {
  companyName: string;
}

export interface UpdateOrganizerResponse {
  id: number;
  user_id: number;
  company_name: string;
  created_at: string;
}

export interface DeleteOrganizerResponse {
  message: string;
}

/**
 * ดึงรายการ organizers ทั้งหมด (ต้อง auth)
 * GET /organizers
 */
export const getOrganizers = async (
  params?: GetOrganizersQueryParams
): Promise<GetOrganizersResponse> => {
  const response = await api.get<GetOrganizersResponse>('/organizers', { params });
  return response.data;
};

/**
 * ดึงข้อมูล organizer โดย ID (ต้อง auth)
 * GET /organizers/:id
 */
export const getOrganizerById = async (id: number): Promise<OrganizerResponse> => {
  const response = await api.get<OrganizerResponse>(`/organizers/${id}`);
  return response.data;
};

/**
 * สร้าง organizer ใหม่ (Admin only - ต้อง auth)
 * POST /organizers
 */
export const createOrganizer = async (
  data: CreateOrganizerRequest
): Promise<CreateOrganizerResponse> => {
  const response = await api.post<CreateOrganizerResponse>('/organizers', data);
  return response.data;
};

/**
 * อัปเดตข้อมูล organizer (Admin only - ต้อง auth)
 * PUT /organizers/:id
 */
export const updateOrganizer = async (
  id: number,
  data: UpdateOrganizerRequest
): Promise<UpdateOrganizerResponse> => {
  const response = await api.put<UpdateOrganizerResponse>(`/organizers/${id}`, data);
  return response.data;
};

/**
 * ลบ organizer (Admin only - ต้อง auth)
 * DELETE /organizers/:id
 */
export const deleteOrganizer = async (id: number): Promise<DeleteOrganizerResponse> => {
  const response = await api.delete<DeleteOrganizerResponse>(`/organizers/${id}`);
  return response.data;
};

