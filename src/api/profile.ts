import api from './axios';

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface UpdateProfileResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

/**
 * อัปเดตข้อมูลโปรไฟล์ (ต้อง auth)
 * PUT /user/profile
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await api.put<UpdateProfileResponse>('/user/profile', data);
  return response.data;
};

/**
 * เปลี่ยนรหัสผ่าน (ต้อง auth)
 * PUT /user/change-password
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await api.put<ChangePasswordResponse>('/user/change-password', data);
  return response.data;
};

