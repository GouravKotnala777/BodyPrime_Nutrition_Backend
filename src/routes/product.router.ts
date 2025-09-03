import express from "express";
import { isUserAdmin, isUserAuthenticated, upload } from "../middlewares/middlewares.js";
import { addImages, allProducts, createProduct, deleteProduct, updateProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, createProduct);
productRouter.route("/all_products").get(isUserAuthenticated, allProducts);
productRouter.route("/add_image").post(isUserAuthenticated, isUserAdmin, upload.array("images", 4), addImages);
productRouter.route("/update_product").put(isUserAuthenticated, isUserAdmin, updateProduct);
productRouter.route("/delete_product").delete(isUserAuthenticated, isUserAdmin, deleteProduct);

export default productRouter;