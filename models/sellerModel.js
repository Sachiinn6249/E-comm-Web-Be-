import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    maxlength: [15, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    match: [
      /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/,
      "Please add a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  storeName: {
    type: String,
    required: [true, "Please enter your store name"],
    trim: true,
    maxlength: [100, "Store name cannot exceed 100 characters"],
  },
  avatarUrl: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  address: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Seller", sellerSchema);
