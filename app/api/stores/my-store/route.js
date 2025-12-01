import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Store from '@/lib/models/Store';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
    await dbConnect();

    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.id;

        const store = await Store.findOne({ owner: userId });
        if (store) {
            return NextResponse.json({ store });
        } else {
            return NextResponse.json({ message: 'Store not found' });
        }
    } catch (error) {
        return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    }
}

