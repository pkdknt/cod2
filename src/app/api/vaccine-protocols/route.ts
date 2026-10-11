import { NextResponse } from 'next/server';
import { VaccineProtocolService, type VaccineProtocolInput } from '@/services/VaccineProtocolService';

export async function GET() {
  try {
    const items = await VaccineProtocolService.list();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Lỗi khi lấy phác đồ tùy chỉnh:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as VaccineProtocolInput;
    if (!data.vaccine || !data.object || !data.schedule) {
      return NextResponse.json(
        { success: false, message: 'Vắc xin, đối tượng và phác đồ là bắt buộc' },
        { status: 400 }
      );
    }
    const item = await VaccineProtocolService.upsert(data);
    return NextResponse.json({ success: true, item, message: 'Đã lưu phác đồ tùy chỉnh.' });
  } catch (error) {
    console.error('Lỗi khi lưu phác đồ tùy chỉnh:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID' }, { status: 400 });
    }
    return NextResponse.json(await VaccineProtocolService.delete(id));
  } catch (error) {
    console.error('Lỗi khi xóa phác đồ tùy chỉnh:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
