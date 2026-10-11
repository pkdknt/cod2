'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cx } from '@/lib/cx';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<ToastTone, string> = {
  success: 'border-green-200 bg-success-soft text-green-800',
  error: 'border-red-200 bg-danger-soft text-red-700',
  info: 'border-sky-200 bg-info-soft text-sky-800',
};

const TONE_ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  error: <XCircle className="h-4 w-4 shrink-0" />,
  info: <Info className="h-4 w-4 shrink-0" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 md:bottom-6"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cx(
              'pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-semibold shadow-pop',
              TONE_STYLE[item.tone]
            )}
          >
            {TONE_ICON[item.tone]}
            <span className="flex-1 leading-relaxed">{item.message}</span>
            <button
              type="button"
              aria-label="Đóng thông báo"
              onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
              className="pressable rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được dùng bên trong <ToastProvider>');
  return ctx;
}
