import api from './axios';

export interface GenerateQRRequest {
  amount: number;
}

export interface GenerateQRResponse {
  success: boolean;
  qr_base64: string; // data URI format: "data:image/png;base64,..."
  format?: string; // "data_uri"
  mime_type?: string; // "image/png"
}

export interface ConfirmPaymentRequest {
  order_id: number;
  amount: number;
  type?: string;
  displayName?: string;
  value?: string;
  completed_at?: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
}

export interface VerifySlipRequest {
  order_id: number;
  amount: number;
  file: File;
}

export interface VerifySlipResponse {
  success: boolean;
  message: string;
  payment_id?: number;
}

/**
 * สร้าง PromptPay QR Code
 * POST /api/payments/qr
 */
export const generateQRCode = async (data: GenerateQRRequest): Promise<GenerateQRResponse> => {
  const response = await api.post<GenerateQRResponse>('/payments/qr', data);
  return response.data;
};

/**
 * ยืนยันการชำระเงิน (Admin/Order owner only)
 * POST /api/payments/confirm
 */
export const confirmPayment = async (data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> => {
  const response = await api.post<ConfirmPaymentResponse>('/payments/confirm', data);
  return response.data;
};

/**
 * อัปโหลดและตรวจสอบ payment slip
 * POST /api/payments/verify-slip
 */
export const verifySlipImage = async (data: VerifySlipRequest): Promise<VerifySlipResponse> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('order_id', data.order_id.toString());
  formData.append('amount', data.amount.toString());

  const response = await api.post<VerifySlipResponse>('/payments/verify-slip', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * ดึง payment slip image โดย order ID
 * GET /api/payments/slip/:order_id
 */
export const getSlipImage = async (orderId: number): Promise<Blob> => {
  const response = await api.get(`/payments/slip/${orderId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * ดึง image โดย filename
 * GET /api/payments/image/:filename
 */
export const getImageByFilename = async (filename: string): Promise<Blob> => {
  const response = await api.get(`/payments/image/${filename}`, {
    responseType: 'blob',
  });
  return response.data;
};

