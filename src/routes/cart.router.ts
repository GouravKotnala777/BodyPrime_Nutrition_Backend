import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { addToCart } from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.route("/add_to_cart").post(isUserAuthenticated, addToCart);

export default cartRouter;