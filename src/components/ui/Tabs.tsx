'use client';

import React from 'react';
import { cx } from '@/lib/cx';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function Tabs({ items, active, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Điều hướng phân hệ"
      className={cx('flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1', className)}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={cx(
              'pressable flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold nowrap-label',
              isActive
                ? 'bg-surface text-primary shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-slate-200/50'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
