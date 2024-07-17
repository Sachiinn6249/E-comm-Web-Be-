import express from "express";
import { CheckOut, verifyPayment } from "../controllers/paymentController.js";

const paymentRoute = express.Router();

paymentRoute.post("/checkout/:userId", CheckOut);

paymentRoute.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  verifyPayment
);
paymentRoute.get(
  "checkout/success?session_id={CHECKOUT_SESSION_ID}",
  (req, res) => {
    res.json({ success: true, payment: "Success" });
  }
);

export default paymentRoute;
