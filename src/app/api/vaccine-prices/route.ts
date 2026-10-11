import { NextResponse, NextRequest } from 'next/server';
import { VaccinePriceService } from '@/services/VaccinePriceService';
import { parsePageParams } from '@/lib/pagination';
import type { VaccinePriceInput } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = parsePageParams(searchParams);

    const { items, pagination } = await VaccinePriceService.getAll({
      q: searchParams.get('q') || '',
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Error fetching vaccine prices:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi lấy danh sách giá vắc xin' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VaccinePriceInput;
    const { name, unit, price } = body;

    if (!name || !unit || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, message: 'Tên, ĐVT và Giá là bắt buộc' },
        { status: 400 }
      );
    }

    const { item } = await VaccinePriceService.upsert(body);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error saving vaccine price:', error);
    return NextResponse.json({ success: false, message: 'Lỗi lưu giá vắc xin' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID vắc xin cần xóa' },
        { status: 400 }
      );
    }

    const ids = idParam.split(',');
    if (ids.length > 1) {
      return NextResponse.json(await VaccinePriceService.bulkDelete(ids));
    }
    return NextResponse.json(await VaccinePriceService.delete(idParam));
  } catch (error) {
    console.error('Error deleting vaccine price:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa vắc xin' }, { status: 500 });
  }
}
