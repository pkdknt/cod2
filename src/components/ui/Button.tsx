'use client';

import React from 'react';
import { cx } from '@/lib/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-strong shadow-sm',
  secondary: 'bg-white text-ink-soft border border-line hover:bg-canvas hover:text-ink',
  ghost: 'bg-transparent text-ink-muted hover:bg-slate-100 hover:text-ink',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
  success: 'bg-success text-white hover:bg-green-700 shadow-sm',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-xs',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        'pressable inline-flex items-center justify-center gap-1.5 rounded-xl font-bold nowrap-label',
        'focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
