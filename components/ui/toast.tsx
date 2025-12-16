'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'badge-success bg-emerald-600/90 text-emerald-50',
    error: 'badge-danger bg-rose-600/95 text-rose-50',
    info: 'badge-premium bg-slate-800/95 text-slate-50',
  }[type];

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slideDown"
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className={`${bgColor} px-6 py-3 rounded-xl shadow-[0_20px_40px_-24px_rgba(0,0,0,0.85)] border border-white/10 backdrop-blur-md max-w-md`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}
