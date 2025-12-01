import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Store from '@/lib/models/Store';
import Product from '@/lib/models/Product';
import Review from '@/lib/models/Review';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/user';


export async function GET(req) {
    await dbConnect();

    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const store = await Store.findOne({ owner: decoded.id })
            .populate('products')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name',
                },
            });

        if (!store) {
            return NextResponse.json({ message: 'Store not found' }, { status: 404 });
        }

        return NextResponse.json(store, { status: 200 });
    } catch (error) {
        console.error('Error in /api/store:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json(
            { message: 'Something went wrong', error: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
