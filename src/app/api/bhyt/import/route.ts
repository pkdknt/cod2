import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytCustomer from '@/models/BhytCustomer';
import { parseVnDate } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Danh sách nhập trống hoặc không hợp lệ' }, { status: 400 });
    }

    // Process items and build bulk operations
    const bulkOps = items.map((item: any) => {
      // Basic validation
      if (!item.bhxh || !item.name) {
        throw new Error('Họ tên và mã BHXH là bắt buộc cho mọi dòng nhập');
      }

      // Convert date string fields to Date objects
      const expiryDate = item.expiry ? parseVnDate(item.expiry) : undefined;
      const dobDate = item.dob ? parseVnDate(item.dob) : undefined;

      const doc: any = {
        name: item.name.trim(),
        cccd: item.cccd ? String(item.cccd).trim() : '',
        dob: item.dob ? String(item.dob).trim() : '',
        gender: item.gender ? String(item.gender).trim() : '',
        birthPlace: item.birthPlace ? String(item.birthPlace).trim() : '',
        kcb: item.kcb ? String(item.kcb).trim() : '',
        receiptDate: item.receiptDate ? String(item.receiptDate).trim() : '',
        receiptNo: item.receiptNo ? String(item.receiptNo).trim() : '',
        amount: item.amount ? String(item.amount).trim() : '',
        support: item.support ? String(item.support).trim() : '',
        months: item.months ? String(item.months).trim() : '',
        staffCode: item.staffCode ? String(item.staffCode).trim() : '',
        phone: item.phone ? String(item.phone).trim() : '',
        expiry: item.expiry ? String(item.expiry).trim() : '',
        needCall: item.needCall ? String(item.needCall).trim() : 'Không',
        renewType: item.renewType ? String(item.renewType).trim() : '',
        callDate: item.callDate ? String(item.callDate).trim() : '',
        relation: item.relation ? String(item.relation).trim() : '',
        note: item.note ? String(item.note).trim() : '',
        contactStatus: item.contactStatus ? String(item.contactStatus).trim() : 'Chưa liên hệ',
      };

      if (expiryDate) doc.expiryDate = expiryDate;
      if (dobDate) doc.dobDate = dobDate;

      return {
        updateOne: {
          filter: { bhxh: String(item.bhxh).trim() },
          update: { $set: doc },
          upsert: true,
        },
      };
    });

    const result = await BhytCustomer.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: `Nhập thành công: ${result.upsertedCount} dòng mới, ${result.modifiedCount} dòng cập nhật`,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error during bulk import of BHYT:', error);
    return NextResponse.json({ message: 'Lỗi khi import dữ liệu: ' + error.message }, { status: 500 });
  }
}
