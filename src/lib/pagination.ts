import type { Pagination } from '@/lib/types';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export interface PageParams {
  page: number;
  pageSize: number;
}

export function parsePageParams(searchParams: URLSearchParams): PageParams {
  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const rawSize = Number.parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isFinite(rawSize) && rawSize > 0
    ? Math.min(rawSize, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  return { page, pageSize };
}

export function buildPagination(page: number, pageSize: number, totalFiltered: number): Pagination {
  return {
    page,
    pageSize,
    totalFiltered,
    totalPages: Math.max(1, Math.ceil(totalFiltered / pageSize)),
  };
}
