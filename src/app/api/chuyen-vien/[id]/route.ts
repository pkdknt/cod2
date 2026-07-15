import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PatientTransfer from '@/models/PatientTransfer';
import { parseVnDate } from '@/lib/utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await req.json();

    const updateData = { ...data };
    
    // Parse dates if present
    if (data.date) {
      updateData.transferDate = parseVnDate(data.date);
    }
    if (data.bhytExpiry) {
      updateData.bhytExpiryDate = parseVnDate(data.bhytExpiry);
    }

    const updatedItem = await PatientTransfer.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedItem) {
      return NextResponse.json({ message: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error('Error updating patient transfer:', error);
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
    
    const deleted = await PatientTransfer.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa hồ sơ thành công' });
  } catch (error: any) {
    console.error('Error deleting patient transfer:', error);
    return NextResponse.json({ message: 'Lỗi xóa hồ sơ: ' + error.message }, { status: 500 });
  }
}
