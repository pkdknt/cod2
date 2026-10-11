'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSortableTable } from '@/hooks/useSortableTable';
import type { Pagination, PatientRecord } from '@/lib/types';

const PAGE_SIZE = 50;

/** Owns the "DS Khách hàng" list: data, filters, sorting, selection, pagination. */
export function useSavedSchedules() {
  const [items, setItems] = useState<PatientRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalFiltered: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [qSearch, setQSearch] = useState('');
  const [filterVaccine, setFilterVaccine] = useState('');
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
        vaccine: filterVaccine,
        sortKey,
        sortDir: sortDirection,
        page: String(pagination.page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/cskh-tiem-chung?${params.toString()}`, { signal: controller.signal });
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
  }, [debouncedQ, filterVaccine, sortKey, sortDirection, pagination.page]);

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [debouncedQ, filterVaccine]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setSelectedIds([]);
  }, [debouncedQ, filterVaccine, pagination.page]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    items,
    pagination,
    loading,
    qSearch,
    setQSearch,
    filterVaccine,
    setFilterVaccine,
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
