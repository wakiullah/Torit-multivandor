import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/user';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export async function POST(req) {
    await dbConnect();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json(
            { message: 'Please add all fields' },
            { status: 400 }
        );
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return NextResponse.json(
            { message: 'User already exists' },
            { status: 400 }
        );
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        const token = generateToken(user._id, user.role);
        const response = NextResponse.json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            },
            { status: 201 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } else {
        return NextResponse.json(
            { message: 'Invalid user data' },
            { status: 400 }
        );
    }
}
