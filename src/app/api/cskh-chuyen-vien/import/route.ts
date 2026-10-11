import { NextResponse } from 'next/server';
import { ReferralService } from '@/services/ReferralService';
import type { ReferralInput } from '@/lib/referral';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Danh sách nhập trống' }, { status: 400 });
    }

    const result = await ReferralService.importMany(items as ReferralInput[]);
    return NextResponse.json({
      success: true,
      ...result,
      message: `Đã nhập ${result.inserted} hồ sơ${result.skipped ? `, bỏ qua ${result.skipped} dòng không hợp lệ` : ''}.`,
    });
  } catch (error) {
    console.error('Lỗi khi nhập hồ sơ chuyển viện:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
