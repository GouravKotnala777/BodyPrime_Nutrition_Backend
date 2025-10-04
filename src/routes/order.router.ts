import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { createOrder, updateOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.route("/create").post(isUserAuthenticated, createOrder);
orderRouter.route("/update").put(isUserAuthenticated, updateOrder);

export default orderRouter;