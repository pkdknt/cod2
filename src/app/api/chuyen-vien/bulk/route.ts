import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PatientTransfer from '@/models/PatientTransfer';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { action, ids, callResult } = data;

    if (action === 'delete') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ message: 'Danh sách ID không hợp lệ' }, { status: 400 });
      }
      const result = await PatientTransfer.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true, message: `Đã xóa thành công ${result.deletedCount} hồ sơ` });
    }

    if (action === 'updateCall') {
      if (!Array.isArray(ids) || ids.length === 0 || !callResult) {
        return NextResponse.json({ message: 'Dữ liệu không hợp lệ' }, { status: 400 });
      }
      const result = await PatientTransfer.updateMany(
        { _id: { $in: ids } },
        { $set: { callResult: callResult, callDate: new Date().toISOString().slice(0, 10) } }
      );
      return NextResponse.json({ success: true, message: `Đã cập nhật trạng thái gọi cho ${result.modifiedCount} hồ sơ` });
    }

    return NextResponse.json({ message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json({ message: 'Lỗi xử lý hàng loạt: ' + error.message }, { status: 500 });
  }
}
