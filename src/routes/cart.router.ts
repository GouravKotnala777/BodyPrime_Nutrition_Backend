import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { addToCart, getCart } from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.route("/get_cart").get(isUserAuthenticated, isUserAuthenticated, getCart);
cartRouter.route("/add_to_cart").post(isUserAuthenticated, addToCart);

export default cartRouter;