import express from "express";
import userRouter from "./routes/user.router.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/middlewares.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/user", userRouter);

app.use(errorMiddleware);

export default app;