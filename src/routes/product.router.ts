import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/middlewares.js";
import { createProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, createProduct);

export default productRouter;