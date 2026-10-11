import { NextResponse } from 'next/server';
import { BhytService } from '@/services/BhytService';
import type { BhytCustomerInput } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Danh sách nhập trống' }, { status: 400 });
    }

    const result = await BhytService.importMany(items as BhytCustomerInput[]);
    return NextResponse.json({
      success: true,
      ...result,
      message: `Đã nhập ${result.inserted} mới, cập nhật ${result.updated}, gộp ${result.merged} bản ghi trùng.`,
    });
  } catch (error) {
    console.error('Lỗi khi nhập dữ liệu BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
