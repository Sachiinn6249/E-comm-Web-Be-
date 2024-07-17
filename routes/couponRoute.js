import express from "express";
import {
  addCoupon,
  applyCoupon,
  cancelCoupon,
  getCoupons,
  deleteCoupon,
} from "../controllers/couponController.js";
import authAdmin from "../middlewares/authAdmin.js";
const couponRoute = express.Router();

couponRoute.post("/add-coupon", authAdmin, addCoupon);
couponRoute.post("/apply-coupon", applyCoupon);
couponRoute.post("/cancel-coupon", cancelCoupon);
couponRoute.get("/get-coupon", getCoupons);
couponRoute.delete("/delete-coupon/:id", deleteCoupon);
export default couponRoute;
