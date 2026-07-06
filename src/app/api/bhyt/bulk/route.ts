import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytCustomer from '@/models/BhytCustomer';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { action, ids, resetAll } = await req.json();

    if (action === 'delete') {
      if (resetAll === true) {
        await BhytCustomer.deleteMany({});
        return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ cơ sở dữ liệu khách hàng BHYT' });
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ message: 'Danh sách ID không hợp lệ' }, { status: 400 });
      }

      const result = await BhytCustomer.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({
        success: true,
        message: `Đã xóa thành công ${result.deletedCount} khách hàng được chọn`,
      });
    }

    return NextResponse.json({ message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Error during bulk BHYT operation:', error);
    return NextResponse.json({ message: 'Lỗi thực thi hàng loạt: ' + error.message }, { status: 500 });
  }
}
