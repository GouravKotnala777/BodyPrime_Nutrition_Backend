import express from "express";
import {login, myProfile, register} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(myProfile);

export default userRouter;