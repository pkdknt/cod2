'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSortableTable } from '@/hooks/useSortableTable';
import type { ReferralRecord } from '@/lib/referral';
import type { Pagination } from '@/lib/types';

const PAGE_SIZE = 50;

/** Owns the CSKH Chuyển viện list: filters, sorting, selection, pagination. */
export function useReferralList() {
  const [items, setItems] = useState<ReferralRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalFiltered: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [qSearch, setQSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [callResult, setCallResult] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedQ = useDebouncedValue(qSearch, 400);
  const { sortKey, sortDirection, requestSort } = useSortableTable('date', 'desc');
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQ,
        from,
        to,
        status,
        callResult,
        sortKey,
        sortDir: sortDirection,
        page: String(pagination.page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/cskh-chuyen-vien?${params.toString()}`, { signal: controller.signal });
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
  }, [debouncedQ, from, to, status, callResult, sortKey, sortDirection, pagination.page]);

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [debouncedQ, from, to, status, callResult]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setSelectedIds([]);
  }, [debouncedQ, from, to, status, callResult, pagination.page]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);

  return {
    items,
    pagination,
    loading,
    qSearch, setQSearch,
    from, setFrom,
    to, setTo,
    status, setStatus,
    callResult, setCallResult,
    selectedIds, setSelectedIds,
    sortKey,
    sortDirection,
    requestSort,
    setPage,
    refresh,
    pageSize: PAGE_SIZE,
  };
}

export type ReferralList = ReturnType<typeof useReferralList>;
