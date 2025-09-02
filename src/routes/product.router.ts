import express from "express";
import { isUserAdmin, isUserAuthenticated, upload } from "../middlewares/middlewares.js";
import { addImages, allProducts, createProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, createProduct);
productRouter.route("/all_products").get(isUserAuthenticated, allProducts);
productRouter.route("/add_image").post(isUserAuthenticated, isUserAdmin, upload.array("images", 4), addImages);

export default productRouter;