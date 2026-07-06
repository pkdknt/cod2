import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import VaccineSchedule from '@/models/VaccineSchedule';

export async function GET(req: NextRequest) {
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

    const items = await VaccineSchedule.find(query)
      .collation({ locale: 'vi', strength: 1 })
      .sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching vaccine schedules:', error);
    return NextResponse.json({ message: 'Lỗi lấy danh sách lịch tiêm: ' + error.message }, { status: 500 });
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
      // Edit
      schedule = await VaccineSchedule.findByIdAndUpdate(
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
      schedule = await VaccineSchedule.create({
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

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    console.error('Error saving vaccine schedule:', error);
    return NextResponse.json({ message: 'Lỗi lưu lịch tiêm: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ message: 'Thiếu ID lịch tiêm cần xóa' }, { status: 400 });
    }

    const ids = idParam.split(',');
    if (ids.length > 1) {
      await VaccineSchedule.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true, message: `Đã xóa ${ids.length} lịch tiêm vắc xin thành công` });
    } else {
      await VaccineSchedule.findByIdAndDelete(idParam);
      return NextResponse.json({ success: true, message: 'Đã xóa lịch tiêm vắc xin thành công' });
    }
  } catch (error: any) {
    console.error('Error deleting vaccine schedule:', error);
    return NextResponse.json({ message: 'Lỗi xóa lịch tiêm: ' + error.message }, { status: 500 });
  }
}
