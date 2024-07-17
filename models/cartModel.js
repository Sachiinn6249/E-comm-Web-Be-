import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      price:{
        type: Number,
        required: true,
        default: 0,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      size: {
        type: String,  
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default mongoose.model("Cart", cartSchema);
