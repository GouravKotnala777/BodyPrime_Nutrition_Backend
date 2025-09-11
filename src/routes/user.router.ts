import express from "express";
import {forgetPassword, getAllUsers, login, logout, myProfile, register, resetPassword, updateMyProfile, verifyEmail} from "../controllers/user.controller.js";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/middlewares.js";

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/my_profile").get(isUserAuthenticated, myProfile);
userRouter.route("/update_profile").put(isUserAuthenticated, updateMyProfile);
userRouter.route("/forget_password").post(forgetPassword);
userRouter.route("/reset_password").put(resetPassword);
userRouter.route("/email_verification").put(verifyEmail);
userRouter.route("/logout").post(isUserAuthenticated, logout);

userRouter.route("/all_users").get(isUserAuthenticated, isUserAdmin, getAllUsers)
export default userRouter;