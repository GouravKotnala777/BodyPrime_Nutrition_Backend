import express from "express";
import { isUserAdmin, isUserAuthenticated, upload } from "../middlewares/middlewares.js";
import { addImages, createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.route("/create_product").post(isUserAuthenticated, isUserAdmin, createProduct);
productRouter.route("/get_products").get(isUserAuthenticated, getProducts);
productRouter.route("/add_image").post(isUserAuthenticated, isUserAdmin, upload.array("images", 4), addImages);
productRouter.route("/update_product").put(isUserAuthenticated, isUserAdmin, updateProduct);
productRouter.route("/delete_product").delete(isUserAuthenticated, isUserAdmin, deleteProduct);

export default productRouter;