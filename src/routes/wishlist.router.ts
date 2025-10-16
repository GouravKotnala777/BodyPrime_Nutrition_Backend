import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { addToWishlist, getWishlist } from "../controllers/wishlist.controller.js";

const wishlistRouter = express.Router();

wishlistRouter.route("/get_wishlist").get(isUserAuthenticated, getWishlist);
wishlistRouter.route("/add_to_wishlist").post(isUserAuthenticated, addToWishlist);

export default wishlistRouter;