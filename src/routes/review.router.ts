import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { getReviews, createReview } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.route("/create/:productID").post(isUserAuthenticated, createReview);
reviewRouter.route("/get_reviews/:productID").get(getReviews);


export default reviewRouter;