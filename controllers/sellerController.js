import Seller from "../models/sellerModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import dotenv from "dotenv";
import bcrypt, { hash } from "bcrypt";
import asyncErrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
import sendEmail from "../utils/sendMail.js";
import { generateToken } from "../utils/generateToken.js";
dotenv.config();

// Seller Register
export const sellerRegister = asyncErrorHandler(async (req, res, next) => {
  try {
    const { name, email, password, storeName,address, about } = req.body;

    const isExist = await Seller.findOne({ email });
    if (isExist) return next(new ErrorHandler("Seller already exists", 409));

    //hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${storeName}&radius=50&size=96&fontFamily=Helvetica&Weight=600`;
    const seller = new Seller({
      name,
      email,
      password: hashedPassword,
      avatarUrl: avatar,
      storeName,
      address,
      about,
    });
    seller.save();
    //generate token
   const token = await generateToken(seller)
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
      html: `<h1>Welcome To <span style="color: green;">#grab</span> family</h1>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSyKgerCy4fQLONUV6BOH5VhoCr-KXvPKw0w&s">
            <p style="font-size: 20px;color: #333;">
            Hello ${storeName},<br>
            We're thrilled to have you join our community. If you have any questions or need assistance, our support team is here to help.
            Thank you for choosing us, and happy selling!<br><br>
            Best regards,
            The #grab Team</p>`,
    };

    await sendEmail(data);
    res.status(201).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in creating Seller");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Seller Login
export const sellerLogin = asyncErrorHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return next(new ErrorHandler("User Not Found", 404));

    //check password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return next(new ErrorHandler("Invalid Passoword", 401));

    //generate token
    const token = await generateToken(seller)
    await res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none", 
      secure: process.env.NODE_ENV === "production"
  });
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in Seller Login");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Seller Logout
export const sellerLogout = asyncErrorHandler(async (req, res, next) => {
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

// Get Seller Profile
export const getProfile = asyncErrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return next(new ErrorHandler("User Not Found", 404));

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in Get Seller Profile");
    return next(new ErrorHandler(error.message, 500));
  }
});

//add products
export const addProduct = asyncErrorHandler(async (req, res, next) => {
  try {
    console.log("Hitted Add product")
    if (!req.files || req.files.length === 0) {
      return next(new ErrorHandler("NO Files were Uploaded", 404));
    }
    console.log("images uploaded");
    const imageData = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      cloudinaryUrl: file.path,
    }));
    console.log("Upload Successfully");

    const { id } = req.params;
    const {
      name,
      description,
      tags,
      specifications,
      price,
      brand,
      category,
      subcategory,
      gender,
      sizechart,
      stock,
    } = req.body;

    const seller = await Seller.findOne({ _id: id });
    if (!seller) return next(new ErrorHandler("Not Authenticated", 404));

    const product = new Product({
      name,
      description,
      tags,
      specifications,
      price,
      images: imageData,
      brand,
      category,
      subcategory,
      gender,
      sizechart,
      stock,
      seller: id,
    });

    const createdProduct = await product.save();

    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    console.log("Error in Add Product");
    return next(new ErrorHandler(error.message, 500));
  }
});

//update product

export const updateProduct = asyncErrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      tags,
      specifications,
      price,
      brand,
      category,
      subcategory,
      gender,
      sizechart,
      stock,
      productId,
    } = req.body;

    const seller = await Seller.findOne({ _id: id });
    if (!seller) return next(new ErrorHandler("Not Authenticated", 404));

    if (!req.files || req.files.length === 0) {
      return next(new ErrorHandler("NO Files werer Uploaded", 404));
    }
    console.log("images uploaded");
    const imageData = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      cloudinaryUrl: file.path,
    }));
    console.log("Upload Successfully");

    const updateProducts = await Product.findOneAndUpdate(
      { _id: productId },
      {
        name,
        description,
        tags,
        specifications,
        price,
        images: imageData,
        brand,
        category,
        subcategory,
        gender,
        sizechart,
        stock,
        seller: id,
      }
    );
    if (!updateProducts)
      return next(new ErrorHandler("Product Updation Failed", 404));
    console.log("Product Updated Successfully");
    res.status(201).json({ success: true, product: updateProducts });
  } catch (error) {
    console.log("Error in Add Product");
    return next(new ErrorHandler(error.message, 500));
  }
}); 

//get seller product orders

export const getProductOrders = asyncErrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the seller by their ID
    const seller = await Seller.findById(id);
    if (!seller) return next(new ErrorHandler("Not Authenticated", 404));

    // Find all products that belong to the seller
    const products = await Product.find({ seller: id });
    const productIds = products.map(product => product._id);

    // Find all orders for these products and populate product and customer details
    const orders = await Order.find({ "orderItems.product": { $in: productIds } })
      .populate("orderItems.product", "name price")
      .populate("user", "name email")
      .populate("orderItems.product.seller", "name email");  // Added to populate seller details from product

    // Extract only the necessary details
    const filteredOrders = orders.map(order => ({
      _id: order._id,
      user: {
        name: order.user.name,
        email: order.user.email
      },
      shippingInfo: order.shippingInfo,
      orderItems: order.orderItems.map(item => ({
        product: {
          name: item.product.name,
          price: item.product.price
        },
        quantity: item.quantity
      })),
      paymentInfo: order.paymentInfo,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      shippedAt: order.shippedAt,
      isVerified: order.isVerified,
      verifiedAt: order.verifiedAt,
      sellerNotified: order.sellerNotified,
    }));

    res.status(200).json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.log("Error in Get Product Orders", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get seller products

export const getSellerProducts = asyncErrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    // Find the seller by their ID
    const seller = await Seller.findById(id);
    if (!seller) return next(new ErrorHandler("Not Authenticated", 404));

    // Find all products that belong to the seller
    const products = await Product.find({ seller: id });

    res.status(200).json({ success: true,product: products });
  } catch (error) {
    console.log("Error in Get Products", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//check user
export const checkSeller = asyncErrorHandler(async (req, res, next) => {
  try {
    console.log("Hitted Seller Check");
    const isSeller =  req.user
    console.log(("this isSeller", isSeller));
    
    if (!isSeller) {
      return res.status(401).json({ message: "Authentication failed", success: false });
    }
    const email = isSeller.data
    const seller = await Seller.findOne({ email }).select('-password');

    res.status(200).json({ message: "Seller authenticated", success: true, data: seller });
  } catch (error) {
    console.error("Error in Check Seller:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});