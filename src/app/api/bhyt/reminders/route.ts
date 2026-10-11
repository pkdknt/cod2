import { NextResponse } from 'next/server';
import { BhytService, type RenewalScope } from '@/services/BhytService';
import { parsePageParams } from '@/lib/pagination';

const SCOPES: RenewalScope[] = ['priority', 'expired', 'due15', 'due30', 'all'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = parsePageParams(searchParams);
    const scopeParam = searchParams.get('scope') || 'priority';
    const scope: RenewalScope = (SCOPES as string[]).includes(scopeParam)
      ? (scopeParam as RenewalScope)
      : 'priority';
    const exportAll = searchParams.get('all') === 'true';

    const { items, pagination } = await BhytService.getRenewalQueue(
      scope,
      exportAll ? 1 : page,
      exportAll ? Number.MAX_SAFE_INTEGER : pageSize,
      exportAll
    );

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Lỗi khi lấy hàng đợi gia hạn:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
