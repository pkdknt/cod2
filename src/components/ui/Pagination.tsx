'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  totalFiltered,
  pageSize,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const from = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalFiltered);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
      <span className="text-xs font-semibold text-slate-500">
        Hiển thị <strong className="text-slate-700">{from}-{to}</strong> trên{' '}
        <strong className="text-slate-700">{totalFiltered}</strong> bản ghi
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Trước
        </button>
        <span className="text-xs font-bold text-slate-600 px-1">
          Trang {page}/{safeTotalPages}
        </span>
        <button
          type="button"
          disabled={disabled || page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Sau <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
