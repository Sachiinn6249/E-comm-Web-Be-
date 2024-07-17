import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";
import asyncErrrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";

//Add Review

export const addReview = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId, rating, comment } = req.body;
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("User Not Found", 404));
  
    const review = await new Review({
      username: user.username,
      avatarUrl: user.avatarUrl,
      rating:rating,
      comment:comment,
      userId: user._id,
      product: productId,
      date: Date.now(),
    });
    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.log("Error in Add Review", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get All Reviews

export const getAllReviews = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id} = req.params;
    const reviews = await Review.find({product:id});
    if (!reviews || reviews.length === 0) {
      return res.status(200).json({ success: true,message:"No Review Available!", data: [] });
    }
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.log("Error in getAllReviews", error.message);
    res.status(500).json({ message: error.message });
  }
});
