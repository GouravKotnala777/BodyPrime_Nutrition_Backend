import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { createOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.route("/create").post(isUserAuthenticated, createOrder);

export default orderRouter;