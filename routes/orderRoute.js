import express from "express";
import {
  placeOrder,
  verifyOrder,
  notifySeller,
  getOrders,
  getOrderList,
  getAllOrders,
  // getSingleOrder,
} from "../controllers/orderController.js";
import authUser from "../middlewares/authUser.js";

const orderRoute = express.Router();

orderRoute.post("/place-order/:userId",  placeOrder);
orderRoute.post("/verify-order/:id", verifyOrder);
orderRoute.post("/notify-seller/:id", notifySeller);
orderRoute.get("/get-order/:userId", getOrders);
orderRoute.get("/get-order/list/:userId", getOrderList);  
orderRoute.get("/get/all/orders",getAllOrders);  
// orderRoute.get("/get-order/:orderId", getSingleOrder);
export default orderRoute;
