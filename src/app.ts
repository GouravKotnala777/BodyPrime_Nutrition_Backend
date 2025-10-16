import express from "express";
import userRouter from "./routes/user.router.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/middlewares.js";
import productRouter from "./routes/product.router.js";
import reviewRouter from "./routes/review.router.js";
import path from "path";
import { fileURLToPath } from "url";
import cartRouter from "./routes/cart.router.js";
import orderRouter from "./routes/order.router.js";
import dotenv from "dotenv";
import wishlistRouter from "./routes/wishlist.router.js";
dotenv.config();

const app = express();
const allowOrigins = process.env.CLIENT_URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:allowOrigins?.split(","),
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials:true
}));

app.use("/api/v1/public", express.static(path.join(__dirname, "../public")));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/order", orderRouter);

app.use(errorMiddleware);

export default app;