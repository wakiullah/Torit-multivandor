import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  variation: { type: Object }, // To store selected variation details
  discountedPrice: { type: Number },
  couponApplied: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Not required, to allow guest orders
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      // Not required for parent orders, but required for sub-orders
    },
    items: [orderItemSchema], // Empty for parent orders

    // --- Fields for Parent-Child Order Relationship ---
    isParent: {
      type: Boolean,
      default: false,
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    subOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    deliveryAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      location: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, required: true, default: 0 },
    finalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Stripe"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "confirmed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    deliveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryMan",
    },
    deliveryPickedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
