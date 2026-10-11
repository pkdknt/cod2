import { NextResponse } from 'next/server';
import { BhytService } from '@/services/BhytService';
import { parsePageParams } from '@/lib/pagination';
import type { BhytCustomerInput, ExpiryBucket, SortDirection } from '@/lib/types';

const BUCKETS: ExpiryBucket[] = ['expired', 'due15', 'due30', 'active', 'unknown'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = parsePageParams(searchParams);
    const bucketParam = searchParams.get('bucket') || '';

    const filters = {
      q: searchParams.get('q') || '',
      bucket: (BUCKETS as string[]).includes(bucketParam) ? (bucketParam as ExpiryBucket) : ('' as const),
      loaiHoSo: searchParams.get('loaiHoSo') || '',
      sortKey: searchParams.get('sortKey') || '',
      sortDir: (searchParams.get('sortDir') as SortDirection) || 'asc',
    };

    // `all=true` returns every matching row (for a full Excel/CSV export).
    if (searchParams.get('all') === 'true') {
      const items = await BhytService.listAll({ ...filters, page: 1, pageSize });
      return NextResponse.json({ success: true, items });
    }

    const { items, pagination } = await BhytService.getAll({ ...filters, page, pageSize });

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body as BhytCustomerInput;

    // Only a create requires a name — partial updates (e.g. marking "Đã gọi") must not.
    if (!data._id && (!data.hoTen || !String(data.hoTen).trim())) {
      return NextResponse.json({ success: false, message: 'Họ tên là bắt buộc' }, { status: 400 });
    }

    const { item, created } = await BhytService.upsert(data);
    return NextResponse.json({
      success: true,
      item,
      message: created ? 'Đã thêm khách hàng.' : 'Đã cập nhật khách hàng.',
    });
  } catch (error) {
    console.error('Lỗi khi lưu khách hàng BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    if (searchParams.get('all') === 'true') {
      return NextResponse.json(await BhytService.deleteAll());
    }
    if (idsParam) {
      return NextResponse.json(await BhytService.bulkDelete(idsParam.split(',')));
    }
    if (id) {
      return NextResponse.json(await BhytService.delete(id));
    }
    return NextResponse.json({ success: false, message: 'Thiếu ID' }, { status: 400 });
  } catch (error) {
    console.error('Lỗi khi xóa khách hàng BHYT:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
