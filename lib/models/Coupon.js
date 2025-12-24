import mongoose from 'mongoose'

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    discount: { type: Number, required: true, min: 1, max: 100 },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    forNewUser: { type: Boolean, default: false },
    forMember: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
)

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema)