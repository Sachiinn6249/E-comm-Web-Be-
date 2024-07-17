import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shippingInfo: {
    fullName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  paymentInfo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  paidAt: {
    type: Date,
  },
  totalPrice: {
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    isCouponApplied: {
      type: Boolean,
      default: false,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  orderStatus: {
    type: String,
    default: "Processing",
  },
  deliveredAt: Date,
  shippedAt: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
  },
  sellerNotified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);
