import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytSoCa from '@/models/BhytSoCa';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const items = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Danh sách nhập trống' }, { status: 400 });
    }

    let importedCount = 0;
    for (const item of items) {
      if (!item.date || !item.type || !item.qty) continue;

      await BhytSoCa.findOneAndUpdate(
        { date: item.date, type: item.type },
        item,
        { upsert: true, new: true }
      );
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Đã nhập và đồng bộ thành công ${importedCount} ca BHYT`
    });
  } catch (error: any) {
    console.error('Error importing BHYT counters:', error);
    return NextResponse.json({ message: 'Lỗi import: ' + error.message }, { status: 500 });
  }
}
