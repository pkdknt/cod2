import { NextResponse } from 'next/server';
import { BhytService } from '@/services/BhytService';

export async function GET() {
  try {
    const stats = await BhytService.getStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    console.error('Lỗi khi thống kê BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
