import { NextResponse } from 'next/server';
import { CskhVaccineService } from '@/services/CskhVaccineService';
import { parsePageParams } from '@/lib/pagination';
import type { ReminderFilter, SortDirection } from '@/lib/types';

const VALID_FILTERS: ReminderFilter[] = ['overdue', 'today', '7', '30', 'all'];

function parseFilter(value: string | null): ReminderFilter {
  return VALID_FILTERS.includes(value as ReminderFilter) ? (value as ReminderFilter) : '30';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = parsePageParams(searchParams);
    const exportAll = searchParams.get('all') === 'true';

    const { items, pagination } = await CskhVaccineService.getReminders({
      filter: parseFilter(searchParams.get('filter')),
      q: searchParams.get('q') || '',
      sortKey: searchParams.get('sortKey') || 'due',
      sortDir: (searchParams.get('sortDir') as SortDirection) || 'asc',
      page: exportAll ? 1 : page,
      pageSize: exportAll ? Number.MAX_SAFE_INTEGER : pageSize,
    });

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Lỗi khi tính nhắc lịch tiêm chủng:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
