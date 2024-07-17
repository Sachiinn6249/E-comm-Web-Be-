import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // order: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Order",
  //   required: true,
  // },
  paymentIntentId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["succeeded", "pending", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);

// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   razorpay_order_id: {
//     type: String,
//     required: true,
//   },
//   razorpay_payment_id: {
//     type: String,
//     required: true,
//   },
//   razorpay_signature: {
//     type: String,
//     required: true,
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export default mongoose.model("Payment", paymentSchema);
