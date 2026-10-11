import { NextResponse } from 'next/server';
import { BhytCaseService } from '@/services/BhytCaseService';
import { parsePageParams } from '@/lib/pagination';
import type { BhytCaseInput } from '@/lib/bhytCase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = parsePageParams(searchParams);

    const { items, pagination } = await BhytCaseService.getAll({
      q: searchParams.get('q') || '',
      month: searchParams.get('month') || '',
      type: searchParams.get('type') || '',
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Lỗi khi lấy số ca BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as BhytCaseInput;
    if (!data.date) {
      return NextResponse.json({ success: false, message: 'Ngày là bắt buộc' }, { status: 400 });
    }
    const { item, created } = await BhytCaseService.upsert(data);
    return NextResponse.json({
      success: true,
      item,
      message: created ? 'Đã thêm số ca.' : 'Đã cập nhật số ca.',
    });
  } catch (error) {
    console.error('Lỗi khi lưu số ca BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID' }, { status: 400 });
    }
    return NextResponse.json(await BhytCaseService.delete(id));
  } catch (error) {
    console.error('Lỗi khi xóa số ca BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
