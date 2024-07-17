import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js";
import asyncErrrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";

//Add Coupon

export const addCoupon = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { code, discount, expiryDate } = req.body;
    const coupon = await new Coupon({
      code,
      discount,
      expiryDate,
      isActive: true,
    });
    await coupon.save();
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.log("An error occurred in Add Coupon");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Apply Coupon
export const applyCoupon = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { code, orderId } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon || coupon.expiryDate < Date.now()) {
      return next(new ErrorHandler("Invalid or expired coupon code", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ErrorHandler("Order Not found!", 400));
    }

    if (
      typeof order.totalPrice.grandTotal !== "number" ||
      isNaN(order.totalPrice.grandTotal)
    ) {
      return next(new ErrorHandler("Invalid total amount for the order", 400));
    }
    const discountAmount =
      (order.totalPrice.grandTotal * coupon.discount) / 100;
    const discount = order.totalPrice.grandTotal - discountAmount;
    order.totalPrice.isCouponApplied = true;
    order.totalPrice.discountAmount = discount;
    await order.save();
    console.log("Final price:", discountAmount);
    res
      .status(201)
      .json({ success: true, data: order, amount: discountAmount });
  } catch (error) {
    console.log("An error occurred in Apply coupon");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Cancel Coupon
export const cancelCoupon = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return next(new ErrorHandler("Cannot find Order", 404));
    order.totalPrice.isCouponApplied = false;
    order.totalPrice.discountAmount = 0;
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.log("An error occurred in Cancel coupon");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Get Coupons

export const getCoupons = asyncErrrorHandler(async (req, res, next) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.log("An error occurred in Get Coupon");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Delete Coupon

export const deleteCoupon = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return next(new ErrorHandler("Coupon Not found!", 400));
    }
    await coupon.remove();
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.log("An error occurred in Delete Coupon");
    return next(new ErrorHandler(error.message, 500));
  }
});
