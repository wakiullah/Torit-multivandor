import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import dbConnect from '@/lib/dbConnect'
import User from '@/lib/models/user'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET(req) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 })
  }

  let payload
  try {
    const verified = await jwtVerify(token, secret)
    payload = verified.payload
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  await dbConnect()

  const user = await User.findById(payload.id).select('-password')

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}