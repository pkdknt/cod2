import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import VaccinePrice from '@/models/VaccinePrice';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    const query: any = {};
    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      query.name = regex;
    }

    const items = await VaccinePrice.find(query)
      .collation({ locale: 'vi', strength: 1 })
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching vaccine prices:', error);
    return NextResponse.json({ message: 'Lỗi lấy danh sách giá vắc xin: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, unit, price, checkupPrice } = body;

    if (!name || !unit || price === undefined || price === null) {
      return NextResponse.json({ message: 'Tên, ĐVT và Giá là bắt buộc' }, { status: 400 });
    }

    let item;
    if (id) {
      item = await VaccinePrice.findByIdAndUpdate(
        id,
        {
          name: name.trim(),
          unit: unit.trim(),
          price: Number(price),
          checkupPrice: checkupPrice !== undefined && checkupPrice !== null ? Number(checkupPrice) : 0
        },
        { new: true }
      );
    } else {
      item = await VaccinePrice.create({
        name: name.trim(),
        unit: unit.trim(),
        price: Number(price),
        checkupPrice: checkupPrice !== undefined && checkupPrice !== null ? Number(checkupPrice) : 0
      });
    }

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error saving vaccine price:', error);
    return NextResponse.json({ message: 'Lỗi lưu giá vắc xin: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ message: 'Thiếu ID vắc xin cần xóa' }, { status: 400 });
    }

    const ids = idParam.split(',');
    if (ids.length > 1) {
      await VaccinePrice.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true, message: `Đã xóa ${ids.length} vắc xin thành công` });
    } else {
      await VaccinePrice.findByIdAndDelete(idParam);
      return NextResponse.json({ success: true, message: 'Đã xóa vắc xin thành công' });
    }
  } catch (error: any) {
    console.error('Error deleting vaccine price:', error);
    return NextResponse.json({ message: 'Lỗi xóa vắc xin: ' + error.message }, { status: 500 });
  }
}
