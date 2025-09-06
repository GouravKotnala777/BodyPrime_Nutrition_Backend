import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/middlewares.js";
import { createReview } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.route("/create/:productID").post(isUserAuthenticated, createReview);


export default reviewRouter;