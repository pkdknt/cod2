import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BhytCustomer from '@/models/BhytCustomer';
import { parseVnDate } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const statusFilter = searchParams.get('statusFilter') || '';
    const callFilter = searchParams.get('callFilter') || '';
    const renewFilter = searchParams.get('renewFilter') || '';
    const sortBy = searchParams.get('sortBy') || 'days';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '500', 10);

    // Build Query
    const query: any = {};

    // Text search
    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { bhxh: searchRegex },
        { cccd: searchRegex },
        { phone: searchRegex },
        { kcb: searchRegex },
      ];
    }

    // Today's date reference
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysLater = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Status Filter
    if (statusFilter) {
      switch (statusFilter) {
        case 'expired':
          query.expiryDate = { $lt: today };
          break;
        case '30':
          query.expiryDate = { $gte: today, $lte: thirtyDaysLater };
          break;
        case '60':
          query.expiryDate = { $gt: thirtyDaysLater, $lte: sixtyDaysLater };
          break;
        case '90':
          query.expiryDate = { $gt: sixtyDaysLater, $lte: ninetyDaysLater };
          break;
        case 'ok':
          query.expiryDate = { $gt: ninetyDaysLater };
          break;
        case 'missing':
          query.$or = [{ expiryDate: { $exists: false } }, { expiryDate: null }];
          break;
      }
    }

    // Call indicator filter
    if (callFilter) {
      query.needCall = callFilter;
    }

    // Renewal status filter
    if (renewFilter) {
      query.renewType = renewFilter;
    }

    // Build Sorting
    const sort: any = {};
    if (sortBy === 'name') {
      sort.name = 1;
    } else if (sortBy === 'expiry' || sortBy === 'days') {
      sort.expiryDate = 1;
    } else if (sortBy === 'callDate') {
      sort.callDate = -1;
    } else {
      sort.expiryDate = 1;
    }

    // Execute query with pagination
    const skip = (page - 1) * pageSize;
    const items = await BhytCustomer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const totalFiltered = await BhytCustomer.countDocuments(query);
    const totalCustomers = await BhytCustomer.countDocuments();

    // Calculate dynamic stats
    const expiredCount = await BhytCustomer.countDocuments({ expiryDate: { $lt: today } });
    const count30 = await BhytCustomer.countDocuments({ expiryDate: { $gte: today, $lte: thirtyDaysLater } });
    const count60 = await BhytCustomer.countDocuments({ expiryDate: { $gt: thirtyDaysLater, $lte: sixtyDaysLater } });
    const count90 = await BhytCustomer.countDocuments({ expiryDate: { $gt: sixtyDaysLater, $lte: ninetyDaysLater } });
    const needCallCount = await BhytCustomer.countDocuments({ needCall: 'Có' });
    const missingCount = await BhytCustomer.countDocuments({
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }],
    });

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        pageSize,
        totalFiltered,
        totalCustomers,
      },
      stats: {
        totalCustomers,
        expiredCount,
        count30,
        count60,
        count90,
        needCallCount,
        missingCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching BHYT:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy danh sách: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.name || !data.bhxh) {
      return NextResponse.json({ message: 'Họ tên và mã BHXH là bắt buộc' }, { status: 400 });
    }

    // Check if customer already exists
    const existing = await BhytCustomer.findOne({ bhxh: data.bhxh });
    if (existing) {
      return NextResponse.json({ message: `Mã BHXH ${data.bhxh} đã tồn tại cho khách hàng ${existing.name}` }, { status: 400 });
    }

    // Parse dob and expiry to Date objects for Mongoose Date index
    const expiryDate = data.expiry ? parseVnDate(data.expiry) : undefined;
    const dobDate = data.dob ? parseVnDate(data.dob) : undefined;

    const newCustomer = await BhytCustomer.create({
      ...data,
      expiryDate,
      dobDate,
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error: any) {
    console.error('Error creating BHYT customer:', error);
    return NextResponse.json({ message: 'Lỗi khi thêm khách hàng: ' + error.message }, { status: 500 });
  }
}
