import mongoose from "mongoose";

const deliveryManSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "car", "van"],
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentOrders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    }],
    completedOrders: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DeliveryMan || mongoose.model("DeliveryMan", deliveryManSchema);