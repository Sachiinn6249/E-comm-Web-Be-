import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function authSeller(req, res, next) {
  
  const token = req.cookies.token;
  console.log("this is user token:", token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token using a strong secret key
    const seller = jwt.verify(token, process.env.JWT_SECRET);
    req.seller = seller;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    if (error.name === "JsonWebTokenError") {
      // Handle specific JWT errors
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else {
      // Handle other errors
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default authSeller;
