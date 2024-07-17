import express from "express";
import http from "http";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { Server } from "socket.io";
import ErrorHandler from "./middlewares/errorHandler.js";
import user from "./routes/userRoute.js";
import admin from "./routes/adminRoute.js";
import seller from "./routes/sellerRoute.js";
import product from "./routes/productRoute.js";
import order from "./routes/orderRoute.js";
import payment from "./routes/paymentRoute.js";
import coupon from "./routes/couponRoute.js";
import connectDataBase from "./config/connectDb.js";

dotenv.config();

const app = express();

connectDataBase();

app.use(
  cors({
    origin: "https://www.grabstore.store",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

morgan.format(
  "custom",
  ":method :url :status :res[content-length] - :response-time ms"
);
app.use(morgan("custom"));

const server = http.createServer(app);
export const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("new-notification", (data) => {
    console.log("New notification:", data);
    io.emit("notification", data);
  });

  socket.on("chat message", (data) => {
    console.log("message: ", data);
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use("/api/v1/user", user);
app.use("/api/v1/admin", admin);
app.use("/api/v1/seller", seller);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);
app.use("/api/v1/payment", payment);
app.use("/api/v1/coupon", coupon);

// Error handling
app.use(ErrorHandler);

export default app;
