import express from "express";
import { isUserAdmin, isUserAuthenticated, upload } from "../middlewares/middlewares.js";
import { addImages, createProduct, deleteProduct, getProducts, getSimilarProduct, getSingleProduct, searchProducts, updateProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.route("/create_product").post(isUserAuthenticated, isUserAdmin, createProduct);
productRouter.route("/search_products").get(searchProducts);
productRouter.route("/get_products").get(getProducts);
productRouter.route("/get_similar_products").get(getSimilarProduct);
productRouter.route("/single_product/:productID").get(getSingleProduct);
productRouter.route("/add_image").post(isUserAuthenticated, isUserAdmin, upload.array("images", 4), addImages);
productRouter.route("/update_product").put(isUserAuthenticated, isUserAdmin, updateProduct);
productRouter.route("/delete_product").delete(isUserAuthenticated, isUserAdmin, deleteProduct);

export default productRouter;