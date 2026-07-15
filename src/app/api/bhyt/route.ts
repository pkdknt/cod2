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
    const workflowFilter = searchParams.get('workflowFilter') || '';
    const phoneFilter = searchParams.get('phoneFilter') || '';
    const sortBy = searchParams.get('sortBy') || 'days';
    const sortDir = searchParams.get('sortDir') || 'asc';
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

    const fifteenDaysLater = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Status Filter (expiryFilter)
    if (statusFilter) {
      switch (statusFilter) {
        case 'expired':
          query.expiryDate = { $lt: today };
          break;
        case 'due15':
          query.expiryDate = { $gte: today, $lte: fifteenDaysLater };
          break;
        case 'due30':
          query.expiryDate = { $gt: fifteenDaysLater, $lte: thirtyDaysLater };
          break;
        case 'active':
          query.expiryDate = { $gt: today };
          break;
        case 'unknown':
          query.$or = [{ expiryDate: { $exists: false } }, { expiryDate: null }];
          break;
        case 'priority':
          query.expiryDate = { $lte: fifteenDaysLater };
          break;
        case 'due30_all':
          query.expiryDate = { $lte: thirtyDaysLater };
          break;
        case 'all':
          query.expiryDate = { $exists: true, $ne: null };
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

    // Workflow status filter
    if (workflowFilter) {
      query.workflowStatus = workflowFilter;
    }

    // Phone filter
    if (phoneFilter) {
      if (phoneFilter === 'has') {
        query.phone = { $ne: null, $exists: true, $regex: /\d+/ };
      } else if (phoneFilter === 'missing') {
        query.$or = [
          { phone: { $exists: false } },
          { phone: null },
          { phone: '' }
        ];
      }
    }

    // Build Sorting
    const sort: any = {};
    const dirMultiplier = sortDir === 'desc' ? -1 : 1;
    if (sortBy === 'name') {
      sort.name = dirMultiplier;
    } else if (sortBy === 'bhxh') {
      sort.bhxh = dirMultiplier;
    } else if (sortBy === 'phone') {
      sort.phone = dirMultiplier;
    } else if (sortBy === 'kcb') {
      sort.kcb = dirMultiplier;
    } else if (sortBy === 'expiry' || sortBy === 'days') {
      sort.expiryDate = dirMultiplier;
    } else if (sortBy === 'workflow') {
      sort.workflowStatus = dirMultiplier;
    } else {
      sort.expiryDate = dirMultiplier;
    }

    // Execute query with pagination
    const skip = (page - 1) * pageSize;
    const items = await BhytCustomer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const totalFiltered = await BhytCustomer.countDocuments(query);
    const totalCustomers = await BhytCustomer.countDocuments();

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        pageSize,
        totalFiltered,
        totalCustomers,
      }
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

    return NextResponse.json({ success: true, item: newCustomer });
  } catch (error: any) {
    console.error('Error creating BHYT customer:', error);
    return NextResponse.json({ message: 'Lỗi khi thêm khách hàng: ' + error.message }, { status: 500 });
  }
}
