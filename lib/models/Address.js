import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
    },
    street: {
      type: String,
      required: [true, "Street address is required."],
    },
    location: {
      type: String, // For apartment, suite, etc.
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
    },
    userId: {
      type: String, // Using String to match next-auth's default user ID type
      ref: "User",
      required: true,
      unique: true, // Ensures one address per user
    },
  },
  { timestamps: true }
);

const Address =
  mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;
