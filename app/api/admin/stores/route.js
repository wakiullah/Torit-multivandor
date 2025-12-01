import dbConnect from '@/lib/dbConnect';
import Store from '@/lib/models/Store';
import User from '@/lib/models/user';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();

  try {
    const stores = await Store.find({}).populate('owner', 'name');
    return NextResponse.json({ success: true, stores });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
