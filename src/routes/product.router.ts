import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/middlewares.js";
import { allProducts, createProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, createProduct);
productRouter.route("/all_products").get(isUserAuthenticated, allProducts);

export default productRouter;