import dbConnect from '@/lib/dbConnect';
import Store from '@/lib/models/Store';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await dbConnect();

  const { storeId } = params;
  const { status } = await req.json();

  if (!status || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
  }

  try {
    const store = await Store.findByIdAndUpdate(storeId, { status }, { new: true });
    if (!store) {
      return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, store });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
