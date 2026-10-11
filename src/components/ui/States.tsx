import React from 'react';
import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import { cx } from '@/lib/cx';
import Button from './Button';

export function EmptyState({ icon, title, description, action, className }: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-ink-muted">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-extrabold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-xs font-medium leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-extrabold text-ink">Đã xảy ra lỗi</h3>
      <p className="mt-1.5 max-w-md text-xs font-medium leading-relaxed text-ink-muted">
        {message ?? 'Không thể tải dữ liệu. Vui lòng thử lại.'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" icon={<RotateCw className="h-3.5 w-3.5" />} onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

export function LoadingRows({ rows = 6, cols = 5, label = 'Đang tải dữ liệu...' }: {
  rows?: number;
  cols?: number;
  label?: string;
}) {
  return (
    <div className="p-4" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-2">
            {Array.from({ length: cols }).map((__, c) => (
              <div
                key={c}
                className="h-9 animate-pulse rounded-lg bg-slate-100"
                style={{ flex: c === 1 ? '2 1 0%' : '1 1 0%' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
