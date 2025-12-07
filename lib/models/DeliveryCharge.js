import mongoose, { Schema } from "mongoose";

const deliveryChargeSchema = new Schema({
  fromLocation: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  toLocation: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  charge: {
    type: Number,
    required: true,
  },
});

const DeliveryCharge =
  mongoose.models.DeliveryCharge ||
  mongoose.model("DeliveryCharge", deliveryChargeSchema);

export default DeliveryCharge;
