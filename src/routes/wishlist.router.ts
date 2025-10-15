import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { addToWishlist } from "../controllers/wishlist.controller.js";

const wishlistRouter = express.Router();

wishlistRouter.route("/add_to_wishlist").post(isUserAuthenticated, addToWishlist);

export default wishlistRouter;