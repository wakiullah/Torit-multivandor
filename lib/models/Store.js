import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your store name'],
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Please enter your store username'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter your store description'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your store email'],
      unique: true,
    },
    contact: {
      type: String,
      required: [true, 'Please enter your store contact number'],
    },
    address: {
      type: String,
      required: [true, 'Please enter your store address'],
    },
    image: {
      type: String,
      required: [true, 'Please add a store logo'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Store || mongoose.model('Store', storeSchema);
