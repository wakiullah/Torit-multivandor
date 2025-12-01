import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/user';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req) {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }
}
