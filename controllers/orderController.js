import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import dotenv from "dotenv";
import asyncErrrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
import sendEmail from "../utils/sendMail.js";
import { io } from "../app.js";
dotenv.config();

export const placeOrder = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, address, city, state, pinCode, phoneNumber } = req.body;
    console.log("the name is :", fullName);
    // Fetch cart items for the user
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    if (!cart || cart.products.length === 0)
      return next(new ErrorHandler("Cart Not Found", 404));

    // Extract order items from cart
    const orderItems = cart.products.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    // total price
    const totalPrice = cart.totalPrice;

    // Create order object
    const order = new Order({
      user: userId,
      shippingInfo: {
        fullName: fullName,
        address: address,
        city: city,
        state: state,
        pincode: pinCode,
        phoneNo: phoneNumber,
      },
      orderItems: orderItems,
      totalPrice: {
        grandTotal: totalPrice,
        isCouponApplied: false, // Change accordingly if coupon is applied
        discountAmount: 0, // Change accordingly if discount is applied
      },
    });

    // Save order to the database
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.log("An error occurred in Place Order!");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Verify order admin
export const verifyOrder = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById({ _id: id });

    if (!order) return next(new ErrorHandler("Order not found", 404));

    order.isVerified = true;
    order.verifiedAt = Date.now();

    const updatedOrder = await order.save();
    const user = order.user;
    //send Notification
    io.emit("notification", {
      id: Date.now(),
      message: "Your order has been confirmed!",
      user,
      read: false,
    });
    console.log("Notification sent");
    res.status(201).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.log("An error occurred in verifyOrder");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Notify Seller
export const notifySeller = asyncErrrorHandler(async (req, res) => {
  console.log("Hitted notifySeller");
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate({
      path: "orderItems.product",
      populate: {
        path: "seller",
        model: "Seller",
      },
    });

    if (!order) return next(new ErrorHandler("Order not found", 404));
    if (!order.isVerified)
      return next(new ErrorHandler("Order not verified", 400));
    if (order.sellerNotified)
      return next(new ErrorHandler("Seller already Notified", 400));

    //send notification
    const seller = order.orderItems[0].product.seller;

    //send Notification
    io.emit("notification", {
      id: Date.now(),
      message: "You have a new Order,please prepare your order and deliver",
      user: seller._id,
      read: false,
    });

    //send notification mail
    const data = {
      from: `#grab. <${process.env.User_ID}>`,
      to: seller.email,
      subject: "You Have a New Order  from #grab!",
      html: `<h1>Order Placed and Confirmed</h1>
           <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSyKgerCy4fQLONUV6BOH5VhoCr-KXvPKw0w&s">
           <p>We are pleased to inform you that a new order has been placed and confirmed.

           <h4>Order Details:</h4>
           <h5 style={"color:green"}>Order ID: ${order.or}<h6>
           <h5 style={"color:green"}>Customer Name and Address: ${order.shippingInfo.address}<h6>
           <h5 style={"color:green"}>Order Date: ${order.createdAt}<h6>
           
           Please prepare the items for shipment as soon as possible.
           
           Best regards,
           #grab.</p>`,
    };

    await sendEmail(data);
    order.sellerNotified = true;
    await order.save();
    res.status(200).json({ success: true, message: "Seller notified " });
  } catch (error) {
    console.log("An error occurred in Notify Seller");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Get all orders

export const getOrders = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.findOne({ user: userId });
    if (!orders) return next(new ErrorHandler("Orders not found", 404));
    if (orders.length === 0)
      return res
        .status(200)
        .json({ success: true, message: "No Orders found" });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.log("An error occurred in getOrders");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Get single order

export const getOrderList = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId });
    if (!orders) return next(new ErrorHandler("Orders not found", 404));
    if (orders.length === 0)
      return res
        .status(200)
        .json({ success: true, message: "No Orders found" });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.log("An error occurred in getOrders");
    return next(new ErrorHandler(error.message, 500));
  }
});;

//get complete order list

export const getAllOrders = asyncErrrorHandler(async (req, res, next) => {
  try {
    const orders = await Order.find();
    if (!orders) return next(new ErrorHandler("Orders not found", 404));
    if (orders.length === 0)
      return res
        .status(200)
        .json({ success: true, message: "No Orders found" });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.log("An error occurred in getOrders");
    return next(new ErrorHandler(error.message, 500));
  }
});