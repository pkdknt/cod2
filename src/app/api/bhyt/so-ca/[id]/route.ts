import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytSoCa from '@/models/BhytSoCa';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { id } = await params;

    const updated = await BhytSoCa.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Không tìm thấy ca để cập nhật' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('Error updating BHYT counter:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await BhytSoCa.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Không tìm thấy ca để xóa' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa ca thành công' });
  } catch (error: any) {
    console.error('Error deleting BHYT counter:', error);
    return NextResponse.json({ message: 'Lỗi xóa: ' + error.message }, { status: 500 });
  }
}
