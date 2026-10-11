import React from 'react';
import { cx } from '@/lib/cx';

/** Consistent card frame for a data table: toolbar + scrollable body + footer. */
export default function TableShell({ toolbar, children, footer, className }: {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)}>
      {toolbar && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-slate-50/60 px-5 py-3">
          {toolbar}
        </div>
      )}
      <div className="relative min-h-0 flex-1 overflow-auto">{children}</div>
      {footer}
    </div>
  );
}

export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('shrink-0 rounded-2xl border border-line bg-surface p-4 shadow-card', className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

export function BatchActionBar({ count, onClear, children }: {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-100 bg-primary-soft px-5 py-2">
      <span className="text-xs font-bold text-primary-strong">
        Đã chọn <strong className="text-ink">{count}</strong> mục
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="pressable rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink-soft hover:bg-canvas"
        >
          Bỏ chọn
        </button>
        {children}
      </div>
    </div>
  );
}
