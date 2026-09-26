
import express from "express";
import { getOrderSummaryData } from "../controllers/dashboard.controller.js";
import { isUserAuthenticated } from "../middlewares/middlewares.js";

const dashboardRouter = express.Router();

dashboardRouter.route("/get_order_summary").get(isUserAuthenticated, isUserAuthenticated, getOrderSummaryData);

export default dashboardRouter;