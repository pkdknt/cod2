import { NextResponse } from 'next/server';
import { ReferralService } from '@/services/ReferralService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const compareMonth = searchParams.get('compareMonth') || '';
    const doctor = searchParams.get('doctor') || '';
    const hospital = searchParams.get('hospital') || '';

    const [report, periods] = await Promise.all([
      ReferralService.getReport(month, compareMonth, doctor || undefined, hospital || undefined),
      ReferralService.periods(),
    ]);

    return NextResponse.json({ success: true, report, periods });
  } catch (error) {
    console.error('Lỗi khi tạo báo cáo chuyển viện:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
