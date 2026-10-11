import { NextResponse, NextRequest } from 'next/server';
import { VaccinePriceService } from '@/services/VaccinePriceService';
import type { VaccinePriceInput } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, items, ids } = body;

    if (action === 'seed') {
      const { created, updated } = await VaccinePriceService.seed();
      return NextResponse.json({
        success: true,
        message: `Đã nạp ${created + updated} vắc xin mẫu (thêm mới: ${created}, cập nhật: ${updated}).`,
      });
    }

    if (action === 'import') {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, message: 'Danh sách nhập trống' }, { status: 400 });
      }
      const { created, updated } = await VaccinePriceService.bulkUpsert(items as VaccinePriceInput[]);
      return NextResponse.json({
        success: true,
        message: `Đã nhập và cập nhật thành công ${created + updated} vắc xin từ file.`,
      });
    }

    if (action === 'deleteSelected') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Danh sách ID cần xóa trống' },
          { status: 400 }
        );
      }
      return NextResponse.json(await VaccinePriceService.bulkDelete(ids));
    }

    if (action === 'clearAll') {
      return NextResponse.json(await VaccinePriceService.deleteAll());
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk operation on vaccine prices:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi thao tác hàng loạt' },
      { status: 500 }
    );
  }
}
