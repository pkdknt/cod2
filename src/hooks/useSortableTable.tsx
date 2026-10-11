'use client';

import { useCallback, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortDirection } from '@/lib/types';

interface SortState {
  key: string;
  direction: SortDirection;
}

/** Shared sort state + header icon renderer for the data tables. */
export function useSortableTable(initialKey = '', initialDirection: SortDirection = 'asc') {
  const [sort, setSort] = useState<SortState>({ key: initialKey, direction: initialDirection });

  const requestSort = useCallback((key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  }, []);

  const renderSortIcon = useCallback(
    (key: string, size = 'h-3 w-3') => {
      if (sort.key !== key) {
        return (
          <ArrowUpDown
            className={`inline-block ml-1 ${size} opacity-40 text-slate-400 group-hover:opacity-100 transition-opacity`}
          />
        );
      }
      if (sort.direction === 'asc') {
        return <ArrowUp className={`inline-block ml-1 ${size} text-teal-600 font-bold`} />;
      }
      return <ArrowDown className={`inline-block ml-1 ${size} text-teal-600 font-bold`} />;
    },
    [sort]
  );

  return { sortKey: sort.key, sortDirection: sort.direction, requestSort, renderSortIcon };
}
