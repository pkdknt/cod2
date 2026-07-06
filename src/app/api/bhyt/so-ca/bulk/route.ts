import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytSoCa from '@/models/BhytSoCa';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action, ids } = body;

    if (action === 'delete') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ message: 'Danh sách ID trống' }, { status: 400 });
      }
      await BhytSoCa.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true, message: `Đã xóa thành công ${ids.length} ca` });
    }

    if (action === 'clearAll') {
      await BhytSoCa.deleteMany({});
      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ số ca BHYT' });
    }

    return NextResponse.json({ message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Error bulk operation on BHYT counters:', error);
    return NextResponse.json({ message: 'Lỗi thao tác hàng loạt: ' + error.message }, { status: 500 });
  }
}
