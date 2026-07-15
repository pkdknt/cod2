import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PatientTransfer from '@/models/PatientTransfer';
import { parseVnDate } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.items || !Array.isArray(data.items)) {
      return NextResponse.json({ message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const itemsToInsert = data.items.map((item: any) => {
      const transferDate = item.date ? parseVnDate(item.date) : new Date();
      const bhytExpiryDate = item.bhytExpiry ? parseVnDate(item.bhytExpiry) : undefined;
      
      return {
        ...item,
        transferDate,
        bhytExpiryDate
      };
    });

    const result = await PatientTransfer.insertMany(itemsToInsert, { ordered: false });

    return NextResponse.json({
      success: true,
      message: `Đã import thành công ${result.length} hồ sơ chuyển viện.`
    });
  } catch (error: any) {
    console.error('Error importing Patient Transfers:', error);
    // If it's a bulk insert error, some might have succeeded
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: `Đã import thành công một phần. Một số bản ghi bị trùng lặp.`
      });
    }
    return NextResponse.json({ message: 'Lỗi khi import: ' + error.message }, { status: 500 });
  }
}
