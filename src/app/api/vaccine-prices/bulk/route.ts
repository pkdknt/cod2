import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import VaccinePrice from '@/models/VaccinePrice';
import { DEFAULT_VACCINES } from '@/lib/defaultVaccinePrices';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action, items, ids } = body;

    if (action === 'seed') {
      // Upsert default vaccines
      let createdCount = 0;
      let updatedCount = 0;

      for (const item of DEFAULT_VACCINES) {
        const existing = await VaccinePrice.findOne({ name: item.name });
        if (existing) {
          existing.unit = item.unit;
          existing.price = item.price;
          existing.checkupPrice = item.checkupPrice;
          await existing.save();
          updatedCount++;
        } else {
          await VaccinePrice.create({
            name: item.name,
            unit: item.unit,
            price: item.price,
            checkupPrice: item.checkupPrice,
          });
          createdCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Đã nạp thành công 36 vắc xin mẫu (thêm mới: ${createdCount}, cập nhật: ${updatedCount}).`
      });
    }

    if (action === 'import') {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ message: 'Danh sách nhập trống' }, { status: 400 });
      }

      let importedCount = 0;
      for (const item of items) {
        const name = item.name?.trim();
        const unit = item.unit?.trim() || 'Mũi';
        const price = Number(item.price) || 0;
        const checkupPrice = Number(item.checkupPrice) || 0;

        if (!name) continue;

        const existing = await VaccinePrice.findOne({ name });
        if (existing) {
          existing.unit = unit;
          existing.price = price;
          existing.checkupPrice = checkupPrice;
          await existing.save();
        } else {
          await VaccinePrice.create({
            name,
            unit,
            price,
            checkupPrice
          });
        }
        importedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Đã nhập và cập nhật thành công ${importedCount} vắc xin từ file.`
      });
    }

    if (action === 'deleteSelected') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ message: 'Danh sách ID cần xóa trống' }, { status: 400 });
      }

      await VaccinePrice.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({
        success: true,
        message: `Đã xóa thành công ${ids.length} vắc xin được chọn.`
      });
    }

    if (action === 'clearAll') {
      await VaccinePrice.deleteMany({});
      return NextResponse.json({
        success: true,
        message: 'Đã xóa toàn bộ bảng giá vắc xin.'
      });
    }

    return NextResponse.json({ message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in bulk operation on vaccine prices:', error);
    return NextResponse.json({ message: 'Lỗi thao tác hàng loạt: ' + error.message }, { status: 500 });
  }
}
