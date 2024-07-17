import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  userRegister,
  Login,
  Logout,
  getUserProfile,
  checkUser,
} from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/register", userRegister);
userRoute.post("/login", Login);
userRoute.post("/logout", Logout);
userRoute.get("/profile/:id", authUser, getUserProfile);
userRoute.get("/check",authUser,checkUser);


export default userRoute;
