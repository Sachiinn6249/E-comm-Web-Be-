import express from "express";
import {
  sellerRegister,
  sellerLogin,
  sellerLogout,
  getProfile,
  addProduct,
  checkSeller,
  getProductOrders,
  getSellerProducts,
} from "../controllers/sellerController.js";

import authSeller from "../middlewares/authSeller.js";
import upload from "../middlewares/uploadFile.js";
import authUser from "../middlewares/authUser.js";
const sellerRoute = express.Router();

sellerRoute.post("/register", sellerRegister);
sellerRoute.post("/login", sellerLogin);
sellerRoute.post("/logout", sellerLogout);
sellerRoute.get("/profile", authUser, getProfile);
sellerRoute.post(
  "/add/product/:id",
  authUser,
  upload.array("images", 10),
  addProduct
);
sellerRoute.get("/check",authUser, checkSeller);
sellerRoute.get("/orders/:id",authUser,getProductOrders);
sellerRoute.get("/get/product/:id",authUser,getSellerProducts);
export default sellerRoute;
