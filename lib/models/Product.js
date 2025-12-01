import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String, required: true }],
    category: { type: String, required: true, index: true },
    inStock: { type: Boolean, default: true },
    stockQty: { type: Number, default: 0, min: 0 },
    storeId: { type: String }, // optional if multi-store
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
)

ProductSchema.index({ name: 'text', description: 'text', tags: 1 })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)