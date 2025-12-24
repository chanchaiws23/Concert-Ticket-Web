import { useState, useCallback } from 'react';
import { createElement } from 'react';
import Toast from '../components/Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? createElement(Toast, {
    message: toast.message,
    type: toast.type,
    onClose: hideToast,
  }) : null;

  return { showToast, hideToast, ToastComponent };
}

