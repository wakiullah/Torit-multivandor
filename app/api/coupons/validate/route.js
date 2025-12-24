import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Coupon from '@/lib/models/Coupon'

export async function POST(req) {
  await dbConnect()

  const { code, cartItems } = await req.json()

  if (!code || !cartItems) {
    return NextResponse.json({ message: 'Coupon code and cart items are required.' }, { status: 400 })
  }

  try {
    const coupon = await Coupon.findOne({ code, expiresAt: { $gt: new Date() } })

    if (!coupon) {
      return NextResponse.json({ message: 'Invalid or expired coupon.' }, { status: 404 })
    }

    let discount = 0
    let discountedAmount = 0
    const applicableItems = cartItems.filter(item => item.storeId && item.storeId.toString() === coupon.store.toString())

    if (applicableItems.length > 0) {
      const totalOfApplicableItems = applicableItems.reduce((total, item) => total + item.price * item.quantity, 0)
      discount = (totalOfApplicableItems * coupon.discount) / 100
      discountedAmount = totalOfApplicableItems - discount
    }

    return NextResponse.json({
      discount,
      discountedAmount,
      coupon
    })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
