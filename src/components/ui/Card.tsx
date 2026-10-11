import React from 'react';
import { cx } from '@/lib/cx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  /** Renders the surface with less padding / different heading treatment. */
  flush?: boolean;
}

export default function Card({ className, children, flush = false }: CardProps) {
  return (
    <div
      className={cx(
        'bg-surface border border-line rounded-3xl shadow-card',
        !flush && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions }: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3 mb-4">
      <div className="min-w-0">
        <h3 className="font-extrabold text-ink text-sm uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-xs text-ink-muted font-semibold mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const toneClass = {
    default: 'text-ink',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  }[tone];

  return (
    <div className="bg-surface border border-line rounded-2xl shadow-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className={cx('mt-1.5 text-2xl font-black tracking-tight', toneClass)}>{value}</p>
      {hint && <p className="mt-1 text-[11px] font-semibold text-ink-muted">{hint}</p>}
    </div>
  );
}
