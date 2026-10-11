import { NextResponse } from 'next/server';
import { ReferralService } from '@/services/ReferralService';
import { parsePageParams } from '@/lib/pagination';
import type { ReferralInput } from '@/lib/referral';
import type { SortDirection } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = parsePageParams(searchParams);

    const { items, pagination } = await ReferralService.getAll({
      q: searchParams.get('q') || '',
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      status: searchParams.get('status') || '',
      callResult: searchParams.get('callResult') || '',
      sortKey: searchParams.get('sortKey') || '',
      sortDir: (searchParams.get('sortDir') as SortDirection) || 'desc',
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chuyển viện:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as ReferralInput;
    if (!data.name || !String(data.name).trim()) {
      return NextResponse.json({ success: false, message: 'Họ tên người bệnh là bắt buộc' }, { status: 400 });
    }
    const { item, created } = await ReferralService.upsert(data);
    return NextResponse.json({
      success: true,
      item,
      message: created ? 'Đã thêm hồ sơ chuyển viện.' : 'Đã cập nhật hồ sơ.',
    });
  } catch (error) {
    console.error('Lỗi khi lưu hồ sơ chuyển viện:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');
    if (idsParam) return NextResponse.json(await ReferralService.bulkDelete(idsParam.split(',')));
    if (id) return NextResponse.json(await ReferralService.delete(id));
    return NextResponse.json({ success: false, message: 'Thiếu ID' }, { status: 400 });
  } catch (error) {
    console.error('Lỗi khi xóa hồ sơ chuyển viện:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
