import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytSoCa from '@/models/BhytSoCa';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const monthFilter = searchParams.get('monthFilter') || '';
    const typeFilter = searchParams.get('typeFilter') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '100', 10);

    const query: any = {};
    if (typeFilter) {
      query.type = typeFilter;
    }
    if (monthFilter) {
      // Query by prefix matching YYYY-MM
      query.date = new RegExp(`^${monthFilter}`);
    }
    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.note = searchRegex;
    }

    const skip = (page - 1) * pageSize;
    const items = await BhytSoCa.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalFiltered = await BhytSoCa.countDocuments(query);
    const totalItems = await BhytSoCa.countDocuments();

    // Query stats: sum by date and sum by type
    const allRecordsForStats = await BhytSoCa.find({});
    
    return NextResponse.json({
      success: true,
      items,
      stats: {
        allRecords: allRecordsForStats
      },
      pagination: {
        page,
        pageSize,
        totalFiltered,
        totalItems
      }
    });
  } catch (error: any) {
    console.error('Error fetching BHYT counters:', error);
    return NextResponse.json({ message: 'Lỗi tải thống kê BHYT: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.date || !data.type || !data.qty) {
      return NextResponse.json({ message: 'Ngày, loại ca và số ca là bắt buộc' }, { status: 400 });
    }

    const newRecord = await BhytSoCa.create(data);
    return NextResponse.json({ success: true, item: newRecord });
  } catch (error: any) {
    console.error('Error creating BHYT counter entry:', error);
    return NextResponse.json({ message: 'Lỗi lưu ca BHYT: ' + error.message }, { status: 500 });
  }
}
