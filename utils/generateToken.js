import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = async (user) => {
 const token = await jwt.sign({ data: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });
 return token
};

export const adminToken = async (res,admin) => {
  const token = await jwt.sign({ email: admin.email, isAdmin:admin.isAdmin }, JWT_SECRET, {
    expiresIn: "1d",
  });
  await res.cookie("token", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none", 
    secure: process.env.NODE_ENV === "production"
});
};


