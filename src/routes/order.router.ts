import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { allOrders, createOrder, sendDeliveryConfirmation, verifyDeliveryConfirmation, myOrders, updateOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.route("/all_orders").get(isUserAuthenticated, allOrders);
orderRouter.route("/my_orders").get(isUserAuthenticated, myOrders);
orderRouter.route("/send_delivery_confirmation").post(isUserAuthenticated, sendDeliveryConfirmation);
orderRouter.route("/verify_delivery_confirmation").put(isUserAuthenticated, verifyDeliveryConfirmation);
orderRouter.route("/create").post(isUserAuthenticated, createOrder);
orderRouter.route("/update").put(isUserAuthenticated, updateOrder);

export default orderRouter;