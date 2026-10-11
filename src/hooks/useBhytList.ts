'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSortableTable } from '@/hooks/useSortableTable';
import type { BhytCustomerRecord, ExpiryBucket, Pagination } from '@/lib/types';

const PAGE_SIZE = 50;

/** Owns the BHYT customer list: data, filters, sorting, selection, pagination. */
export function useBhytList() {
  const [items, setItems] = useState<BhytCustomerRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalFiltered: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [qSearch, setQSearch] = useState('');
  const [bucket, setBucket] = useState<ExpiryBucket | ''>('');
  const [loaiHoSo, setLoaiHoSo] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedQ = useDebouncedValue(qSearch, 400);
  const { sortKey, sortDirection, requestSort, renderSortIcon } = useSortableTable('');
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQ,
        bucket,
        loaiHoSo,
        sortKey,
        sortDir: sortDirection,
        page: String(pagination.page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/bhyt?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error('API query failed');
      const result = await res.json();
      if (controller.signal.aborted) return;
      setItems(result.items || []);
      if (result.pagination) setPagination(result.pagination);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [debouncedQ, bucket, loaiHoSo, sortKey, sortDirection, pagination.page]);

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [debouncedQ, bucket, loaiHoSo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setSelectedIds([]);
  }, [debouncedQ, bucket, loaiHoSo, pagination.page]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);

  return {
    items,
    pagination,
    loading,
    qSearch,
    setQSearch,
    bucket,
    setBucket,
    loaiHoSo,
    setLoaiHoSo,
    selectedIds,
    setSelectedIds,
    sortKey,
    sortDirection,
    requestSort,
    renderSortIcon,
    setPage,
    refresh,
    pageSize: PAGE_SIZE,
  };
}

export type BhytList = ReturnType<typeof useBhytList>;
