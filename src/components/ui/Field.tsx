import React from 'react';
import { cx } from '@/lib/cx';

const CONTROL =
  'w-full rounded-xl border border-line bg-surface p-2.5 text-xs font-semibold text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-muted/70';

export function Field({ label, hint, htmlFor, className, children }: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cx('min-w-0', className)}>
      <label htmlFor={htmlFor} className="block text-xs font-bold text-ink-soft mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] font-medium text-ink-muted">{hint}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...rest }: InputProps) {
  return (
    <input
      className={cx(CONTROL, invalid && 'border-danger focus:border-danger', className)}
      {...rest}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...rest }: SelectProps) {
  return (
    <select
      className={cx(CONTROL, invalid && 'border-danger focus:border-danger', className)}
      {...rest}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cx(CONTROL, 'min-h-[88px] resize-y', invalid && 'border-danger focus:border-danger', className)}
      {...rest}
    />
  );
}

/** Search box with a leading icon slot. */
export function SearchInput({ className, ...rest }: InputProps) {
  return <Input className={cx('pl-9', className)} {...rest} />;
}
