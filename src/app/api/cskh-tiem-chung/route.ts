import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CskhVaccine from '@/models/CskhVaccine';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const vaccine = searchParams.get('vaccine') || '';

    const query: any = {};
    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { patientName: regex },
        { phone: regex },
        { vaccine: regex }
      ];
    }

    if (vaccine) {
      if (vaccine.includes(' - ')) {
        const brand = vaccine.split(' - ').slice(-1)[0];
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { vaccine: vaccine },
            { vaccine: brand }
          ]
        });
      } else {
        query.vaccine = vaccine;
      }
    }

    const items = await CskhVaccine.find(query)
      .collation({ locale: 'vi', strength: 1 })
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách CSKH Tiêm chủng:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, patientCode, patientName, phone, dob, gender, address, vaccine, protocolId, dates, dueOverrides, notes } = body;

    if (!patientName || !vaccine || !protocolId) {
      return NextResponse.json({ message: 'Tên bệnh nhân, Vắc xin và Phác đồ là bắt buộc' }, { status: 400 });
    }

    let schedule;
    if (id) {
      // Update
      schedule = await CskhVaccine.findByIdAndUpdate(
        id,
        {
          patientCode: patientCode ? patientCode.trim() : undefined,
          patientName: patientName.trim(),
          phone: phone ? phone.trim() : undefined,
          dob,
          gender,
          address: address ? address.trim() : undefined,
          vaccine,
          protocolId,
          dates: dates || ['', '', '', '', '', ''],
          dueOverrides: dueOverrides || ['', '', '', '', '', ''],
          notes: notes || ['', '', '', '', '', '']
        },
        { new: true }
      );
    } else {
      // Create new
      schedule = await CskhVaccine.create({
        patientCode: patientCode ? patientCode.trim() : undefined,
        patientName: patientName.trim(),
        phone: phone ? phone.trim() : undefined,
        dob,
        gender,
        address: address ? address.trim() : undefined,
        vaccine,
        protocolId,
        dates: dates || ['', '', '', '', '', ''],
        dueOverrides: dueOverrides || ['', '', '', '', '', ''],
        notes: notes || ['', '', '', '', '', '']
      });
    }

    return NextResponse.json({ schedule, message: 'Lưu thành công!' });
  } catch (error: any) {
    console.error('Lỗi khi lưu CSKH Tiêm chủng:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    if (idsParam) {
      const ids = idsParam.split(',');
      await CskhVaccine.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ message: 'Đã xóa các mục đã chọn' });
    } else if (id) {
      await CskhVaccine.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Xóa thành công' });
    } else {
      return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Lỗi khi xóa CSKH Tiêm chủng:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
