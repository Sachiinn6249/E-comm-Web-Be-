import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import Seller from "../models/sellerModel.js";
import asyncErrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
import bcrypt from "bcrypt";
import { adminToken } from "../utils/generateToken.js";

//admin Login
export const adminLogin = asyncErrorHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return next(new ErrorHandler("Admin Not Found", 404));

    const isMatch = await bcrypt.compare(password, admin.password);
    // if (!isMatch) return next(new ErrorHandler("Invalid Passoword", 401));
    if(!isMatch) return res.status(403).json({ message: "Invalid Password"});

    //generate token
    console.log("Hitted Login Session")
    await adminToken(res,admin);

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.log("Error in Admin Login");
    return next(new ErrorHandler(error.message, 500));
  }
});
//admin Logout
  export const adminLogout = asyncErrorHandler(async (req, res, next) => {
    try {
      // Clear the token cookie on the client-side
      res.cookie('token', '', { // Set empty token to expire cookie
        maxAge: 0,
        httpOnly: true,
      });
    
        return res
        .status(200)
        .json({ success: true, message: "Logged Out Successfully!" });
     
      
    } catch (error) {
      console.log("Error in Logout");
      return next(new ErrorHandler(error.message, 500));
    }
  });
//get single user
export const getSingleUser = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById({ _id: id });
    if (!user) return next(new ErrorHandler("User Not Found", 404));
    console.log("Hitted successfully");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log("Error in getSingleUser", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get all users
export const getAllUsers = asyncErrorHandler(async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) return next(new ErrorHandler("Users Not Found", 404));

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("Error in getAllUsers", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get single Seller
export const getSingleSeller = asyncErrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById({ _id: id });
    if (!seller) return next(new ErrorHandler("Seller not found", 404));

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in getSingleSeller", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get all sellers
export const getAllSeller = asyncErrorHandler(async (req, res, next) => {
  try {
    const sellers = await Seller.find();
    if (!sellers) return next(new ErrorHandler("Sellers not found", 404));

    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    console.log("Error in getAllSeller", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const checkAdmin = asyncErrorHandler(async (req, res, next) => {
  try {
    console.log("Hitted Admin Check");
    const isAdmin =  req.admin
    
    if (!isAdmin) {
      return res.status(401).json({ message: "Authentication failed", success: false });
    }
    const email = isAdmin.email
    const admin = await Admin.findOne({ email }).select('-password');
    console.log("Admin Data:",admin);
    res.status(200).json({ message: "Admin authenticated", success: true, data: admin });
  } catch (error) {
    console.error("Error in Check Admin:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});