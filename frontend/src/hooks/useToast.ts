import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ToastType } from '../components/Toast';
import type { ToastItem } from '../components/ToastContainer';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = uuidv4();
    const toast: ToastItem = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('success', title, message, duration);
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('error', title, message, duration);
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('warning', title, message, duration);
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('info', title, message, duration);
  }, [addToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts,
  };
}; 