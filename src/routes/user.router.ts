import express from "express";
import {forgetPassword, login, logout, myProfile, register, resetPassword, verifyEmail} from "../controllers/user.controller.js";
import { isUserAuthenticated } from "../middlewares/middlewares.js";

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(isUserAuthenticated, myProfile);
userRouter.route("/forget_password").post(forgetPassword);
userRouter.route("/reset_password").put(resetPassword);
userRouter.route("/email_verification").put(verifyEmail);
userRouter.route("/logout").post(isUserAuthenticated, logout);

export default userRouter;