import { NextResponse } from 'next/server';
import { BhytCaseService } from '@/services/BhytCaseService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const a = searchParams.get('a') || '';
    const b = searchParams.get('b') || '';

    const [stats, periods] = await Promise.all([BhytCaseService.getStats(), BhytCaseService.periods()]);

    const payload: Record<string, unknown> = { success: true, stats, periods };
    if (kind === 'month' || kind === 'year') {
      payload.compare = await BhytCaseService.compare(kind, a, b);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Lỗi khi thống kê số ca BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
