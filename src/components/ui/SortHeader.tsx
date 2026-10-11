'use client';

import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cx } from '@/lib/cx';
import type { SortDirection } from '@/lib/types';

interface SortHeaderProps {
  label: React.ReactNode;
  sortKey: string;
  activeKey: string;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

const ALIGN = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export default function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
  className,
  style,
}: SortHeaderProps) {
  const isActive = activeKey === sortKey;
  return (
    <th
      scope="col"
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      onClick={() => onSort(sortKey)}
      className={cx(
        'border border-line px-3 py-2 cursor-pointer select-none group transition-colors hover:bg-slate-100 hover:text-ink',
        className
      )}
      style={style}
    >
      <div className={cx('flex items-center gap-1', ALIGN[align])}>
        <span>{label}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-primary font-bold" />
          ) : (
            <ArrowDown className="h-3 w-3 text-primary font-bold" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-40 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </th>
  );
}
