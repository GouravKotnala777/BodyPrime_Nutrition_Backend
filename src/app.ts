import express from "express";
import userRouter from "./routes/user.router.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/middlewares.js";
import productRouter from "./routes/product.router.js";

dotenv.config();

const app = express();
const allowOrigins = process.env.CLIENT_URL

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:allowOrigins?.split(","),
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials:true
}))

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);

app.use(errorMiddleware);

export default app;