import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytCustomer from '@/models/BhytCustomer';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fifteenDaysLater = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const totalCustomers = await BhytCustomer.countDocuments();
    const expiredCount = await BhytCustomer.countDocuments({ expiryDate: { $lt: today } });
    const due15Count = await BhytCustomer.countDocuments({ expiryDate: { $gte: today, $lte: fifteenDaysLater } });
    const due30Count = await BhytCustomer.countDocuments({ expiryDate: { $gt: fifteenDaysLater, $lte: thirtyDaysLater } });
    const activeCount = await BhytCustomer.countDocuments({ expiryDate: { $gt: today } });
    const unknownCount = await BhytCustomer.countDocuments({
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }],
    });

    const heroPriority = expiredCount + due15Count;

    // 5 closest upcoming expirations
    const upcoming = await BhytCustomer.find({ expiryDate: { $exists: true, $ne: null } })
      .sort({ expiryDate: 1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers,
        expiredCount,
        due15Count,
        due30Count,
        activeCount,
        unknownCount,
        heroPriority
      },
      upcoming
    });
  } catch (error: any) {
    console.error('Error fetching BHYT stats:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy thống kê BHYT: ' + error.message }, { status: 500 });
  }
}
