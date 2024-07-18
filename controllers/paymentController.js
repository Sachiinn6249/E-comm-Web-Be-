import Cart from "../models/cartModel.js";
import Stripe from "stripe";

import dotenv from "dotenv";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import asyncErrrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//Check out
export const CheckOut = asyncErrrorHandler(async (req, res, next) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product"
  );

  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }
  const total = cart.totalPrice;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.products.map((item) => {
        const product = item.product;
        const imageUrl = product.images[0]?.url; // Get the first image URL
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name,
              images: imageUrl ? [imageUrl] : [], // Include the image URL if available
            },
            unit_amount: Math.round(product.price * 100), // Stripe uses cents
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
      success_url: `${process.env.FRONTEND_HOST}user/order/success`,
      cancel_url: `${process.env.FRONTEND_HOST}user/home`,
    });

    console.log("Session:", session);
    // Create a payment record

    if (session) {
      const payment = new Payment({
        user: userId,
        paymentIntentId: session.id,
        amount: total,
        currency: "inr",
        status: "pending",
      });

      await payment.save();
      // Clear user's cart
      await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } });
    }
    console.log("Payment Successful");
    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

//verify payment

export const verifyPayment = asyncErrrorHandler(async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_SECRET_KEY
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update payment status to succeeded
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId: session.payment_intent },
        { status: "succeeded" },
        { new: true }
      );

      if (payment) {
        const order = await Order.findById(payment.order);
        if (order) {
          order.paymentInfo.status = true;
          await order.save();
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.log("Error in verifyPayment", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});
