import mongoose, { Schema } from "mongoose";

const locationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Location =
  mongoose.models.Location || mongoose.model("Location", locationSchema);

export default Location;
