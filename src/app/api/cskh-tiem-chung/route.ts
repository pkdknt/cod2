import { NextResponse } from 'next/server';
import { CskhVaccineService } from '@/services/CskhVaccineService';
import { parsePageParams } from '@/lib/pagination';
import type { PatientInput, SortDirection } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = parsePageParams(searchParams);

    const { items, pagination } = await CskhVaccineService.getAll({
      q: searchParams.get('q') || '',
      vaccine: searchParams.get('vaccine') || '',
      sortKey: searchParams.get('sortKey') || '',
      sortDir: (searchParams.get('sortDir') as SortDirection) || 'asc',
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách CSKH Tiêm chủng:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      const result = await CskhVaccineService.importMany(body as PatientInput[]);
      const skipped = result.matched > 0 ? `, bỏ qua ${result.matched} hồ sơ đã tồn tại` : '';
      return NextResponse.json({
        success: true,
        count: result.inserted,
        message: `Đã nhập thành công ${result.inserted} hồ sơ${skipped}!`,
      });
    }

    const data = body as PatientInput;
    if (!data.patientName || !data.vaccine || !data.protocolId) {
      return NextResponse.json(
        { success: false, message: 'Tên bệnh nhân, Vắc xin và Phác đồ là bắt buộc' },
        { status: 400 }
      );
    }

    const { item, created } = await CskhVaccineService.upsert(data);
    return NextResponse.json({
      success: true,
      item,
      message: created ? 'Lưu thành công!' : 'Cập nhật thành công!',
    });
  } catch (error) {
    console.error('Lỗi khi lưu CSKH Tiêm chủng:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    if (searchParams.get('all') === 'true') {
      return NextResponse.json(await CskhVaccineService.deleteAll());
    }
    if (idsParam) {
      return NextResponse.json(await CskhVaccineService.bulkDelete(idsParam.split(',')));
    }
    if (id) {
      return NextResponse.json(await CskhVaccineService.delete(id));
    }
    return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });
  } catch (error) {
    console.error('Lỗi khi xóa CSKH Tiêm chủng:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
