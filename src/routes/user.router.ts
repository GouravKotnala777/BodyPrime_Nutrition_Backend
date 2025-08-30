import express from "express";
import {login, myProfile, register} from "../controllers/user.controller.js";
import { isUserAuthenticated } from "../middlewares/middlewares.js";

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(isUserAuthenticated, myProfile);

export default userRouter;