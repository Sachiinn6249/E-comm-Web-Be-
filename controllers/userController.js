import User from "../models/userModel.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import asyncErrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
import sendEmail from "../utils/sendMail.js";
import { generateToken } from "../utils/generateToken.js";
dotenv.config();

// User Register
export const userRegister = asyncErrorHandler(async (req, res, next) => {
  try {
    const { username, email,password } = req.body;

    const isExist = await User.findOne({ email });
    if (isExist) return next(new ErrorHandler("User already exists", 409));

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${username}&radius=50&size=96&fontFamily=Helvetica&Weight=600`;
    const user = new User({
      username,
      email,
      password:  hashedPassword,
      avatarUrl: avatar,
    });
    user.save();

    //generate token
    console.log("Hitted token")
    const token = await generateToken(user);
    await res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none", 
      secure: process.env.NODE_ENV === "production"
  });
    //send mail
    const data = {
      from: `#grab. <${process.env.User_ID}>`,
      to: email,
      subject: "Welcome to #grab!",
      html: `<h1>Hello Sachin,Welcome To #grab. family</h1>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSyKgerCy4fQLONUV6BOH5VhoCr-KXvPKw0w&s">
            <p>Subject: Welcome to [Your E-Commerce Website Name]!
            Hi ${username},
            We're thrilled to have you join our community. As a token of our appreciation, here's a special welcome offer just for you: <span style="color:red">FLAT20<span/>.
            Explore our wide range of products and enjoy a seamless shopping experience. If you have any questions or need assistance, our support team is here to help.
            Thank you for choosing us, and happy shopping!
            Best regards,
            The #grab Team</p>`,
    };

    await sendEmail(data);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.log("Error in creating user");
    return next(new ErrorHandler(error.message, 500));
  }
});

//User Login
export const Login = asyncErrorHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) return next(new ErrorHandler("Invalid Passoword", 401));
    if(!isMatch) return res.status(403).json({ message: "Invalid Password"});

    //generate token
    const token = await generateToken(user);
    
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log("Error in Login");
    return next(new ErrorHandler(error.message, 500));
  }
});

//User Logout
export const Logout = asyncErrorHandler(async (req, res, next) => {
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

// Get User Profile
export const  getUserProfile = asyncErrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    res.status(200).json({ success: true,data: user });
  } catch (error) {
    console.log("Error in Get User Profile");
    return next(new ErrorHandler(error.message, 500));
  }
});

//check user
export const checkUser = asyncErrorHandler(async (req, res, next) => {
  try {
    console.log("Hitted User Check");
    const isUser =  req.user
    console.log(("this isUser", isUser));
    
    if (!isUser) {
      return res.status(401).json({ message: "Authentication failed", success: false });
    }
    const email = isUser.data
    const user = await User.findOne({ email }).select('-password');

    res.status(200).json({ message: "User authenticated", success: true, data: user });
  } catch (error) {
    console.error("Error in Check User:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});