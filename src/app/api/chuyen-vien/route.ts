import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PatientTransfer from '@/models/PatientTransfer';
import { parseVnDate } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const statusFilter = searchParams.get('statusFilter') || '';
    const callFilter = searchParams.get('callFilter') || '';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortDir = searchParams.get('sortDir') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '100', 10);

    const query: any = {};

    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { patientCode: searchRegex },
        { phone: searchRegex },
        { cccd: searchRegex },
        { destinationHospital: searchRegex }
      ];
    }

    if (fromDate || toDate) {
      query.transferDate = {};
      if (fromDate) {
        query.transferDate.$gte = new Date(fromDate);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        query.transferDate.$lte = to;
      }
    }

    if (statusFilter) {
      query.status = statusFilter;
    }

    if (callFilter) {
      query.callResult = callFilter;
    }

    const sort: any = {};
    const direction = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'date') {
      sort.transferDate = direction;
    } else {
      sort[sortBy] = direction;
    }

    const skip = (page - 1) * pageSize;
    const items = await PatientTransfer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const totalFiltered = await PatientTransfer.countDocuments(query);
    const totalItems = await PatientTransfer.countDocuments();

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        pageSize,
        totalFiltered,
        totalItems,
      }
    });
  } catch (error: any) {
    console.error('Error fetching Patient Transfers:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy danh sách: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ message: 'Họ tên bệnh nhân là bắt buộc' }, { status: 400 });
    }

    const transferDate = data.date ? parseVnDate(data.date) : new Date();
    const bhytExpiryDate = data.bhytExpiry ? parseVnDate(data.bhytExpiry) : undefined;

    const newTransfer = await PatientTransfer.create({
      ...data,
      transferDate,
      bhytExpiryDate
    });

    return NextResponse.json({ success: true, item: newTransfer });
  } catch (error: any) {
    console.error('Error creating Patient Transfer:', error);
    return NextResponse.json({ message: 'Lỗi khi tạo hồ sơ: ' + error.message }, { status: 500 });
  }
}
