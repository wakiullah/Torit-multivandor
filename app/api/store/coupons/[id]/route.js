import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import dbConnect from '@/lib/dbConnect'
import Store from '@/lib/models/Store'
import Coupon from '@/lib/models/Coupon'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function DELETE(req, { params }) {
  const token = req.cookies.get('token')?.value
  const { id } = params

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

  const userStore = await Store.findOne({ user: payload.id })

  if (!userStore) {
    return NextResponse.json({ message: 'You do not have a store.' }, { status: 403 })
  }

  try {
    const coupon = await Coupon.findOne({ _id: id, store: userStore._id })

    if (!coupon) {
      return NextResponse.json({ message: 'Coupon not found or you do not have permission to delete it.' }, { status: 404 })
    }

    await coupon.deleteOne()

    return NextResponse.json({ message: 'Coupon deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
