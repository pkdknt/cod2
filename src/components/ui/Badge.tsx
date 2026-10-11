import React from 'react';
import { cx } from '@/lib/cx';

export type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  default: 'bg-primary-soft text-primary-strong border border-teal-200',
  success: 'bg-success-soft text-green-800 border border-green-200',
  warning: 'bg-warning-soft text-amber-800 border border-amber-200',
  danger: 'bg-danger-soft text-red-700 border border-red-200',
  info: 'bg-info-soft text-sky-800 border border-sky-200',
  neutral: 'bg-slate-100 text-ink-soft border border-line',
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ tone = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold nowrap-label',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
