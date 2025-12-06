import mongoose from "mongoose";

const VariationSchema = new mongoose.Schema({
  attributes: [
    {
      name: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  price: { type: Number, required: true, min: 0 },
  sku: { type: String }, // Stock Keeping Unit for this specific variation
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    mrp: { type: Number, min: 0 }, // Made optional
    price: { type: Number, min: 0 }, // Made optional
    images: [{ type: String }],
    category: { type: String, required: true, index: true },
    inStock: { type: Boolean, default: true }, // This might be derived from variations' stock
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    variations: [VariationSchema], // Add variations array
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
