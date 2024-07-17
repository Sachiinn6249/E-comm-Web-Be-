import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import {
  adminLogin,
  adminLogout,
  // getAdminProfile,
  getAllUsers,
  getSingleUser,
  getAllSeller,
  getSingleSeller,
  checkAdmin,
} from "../controllers/adminController.js";

const adminRoute = express.Router();
adminRoute.post("/login", adminLogin);
adminRoute.post("/logout", adminLogout);
// adminRoute.get("/get/profile/:id", authAdmin, getAdminProfile);
adminRoute.get("/user/:id", authAdmin, getSingleUser);
adminRoute.get("/users", authAdmin, getAllUsers);
adminRoute.get("/seller/:id", authAdmin, getSingleSeller);
adminRoute.get("/sellers", authAdmin, getAllSeller);
adminRoute.get("/check",authAdmin,checkAdmin);

export default adminRoute;
