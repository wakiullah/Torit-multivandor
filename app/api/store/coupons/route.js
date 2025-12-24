import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import dbConnect from '@/lib/dbConnect'
import Store from '@/lib/models/Store'
import Coupon from '@/lib/models/Coupon'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(req) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'You must be logged in to create a coupon.' }, { status: 401 })
  }

  let payload
  try {
    const verified = await jwtVerify(token, secret)
    payload = verified.payload
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token.' }, { status: 401 })
  }

  await dbConnect()

  const userStore = await Store.findById(payload.storeId)

  if (!userStore) {
    return NextResponse.json({ message: 'You do not have a store to create coupons for.' }, { status: 403 })
  }

  const { code, description, discount, expiresAt } = await req.json()

  try {
    const newCoupon = new Coupon({
      code,
      description,
      discount,
      expiresAt,
      store: userStore._id
    })

    await newCoupon.save()

    return NextResponse.json(newCoupon, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

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

  const userStore = await Store.findById(payload.storeId)

  if (!userStore) {
    return NextResponse.json({ message: 'You do not have a store.' }, { status: 403 })
  }

  try {
    const coupons = await Coupon.find({ store: userStore._id })
    return NextResponse.json(coupons)
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}