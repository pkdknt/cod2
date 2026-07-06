import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytCustomer from '@/models/BhytCustomer';
import { parseVnDate } from '@/lib/utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID khách hàng' }, { status: 400 });
    }

    // Process updates
    const updates: any = { ...body };

    // Update Date fields if strings are changed
    if (body.expiry !== undefined) {
      updates.expiryDate = body.expiry ? parseVnDate(body.expiry) : null;
    }
    if (body.dob !== undefined) {
      updates.dobDate = body.dob ? parseVnDate(body.dob) : null;
    }

    const updatedCustomer = await BhytCustomer.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json({ message: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error: any) {
    console.error('Error updating BHYT customer:', error);
    return NextResponse.json({ message: 'Lỗi khi cập nhật: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID khách hàng' }, { status: 400 });
    }

    const deletedCustomer = await BhytCustomer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return NextResponse.json({ message: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa khách hàng thành công' });
  } catch (error: any) {
    console.error('Error deleting BHYT customer:', error);
    return NextResponse.json({ message: 'Lỗi khi xóa: ' + error.message }, { status: 500 });
  }
}
