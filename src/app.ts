import express from "express";
import userRouter from "./routes/user.router.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/user", userRouter);

export default app;