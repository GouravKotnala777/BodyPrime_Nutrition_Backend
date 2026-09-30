
import express from "express";
import { getUsersSummaryData, getProductsSummaryData, getOrderSummaryData, getBrandToCategoryStockData, getAllOutStockedProducts } from "../controllers/dashboard.controller.js";
import { isUserAuthenticated } from "../middlewares/middlewares.js";

const dashboardRouter = express.Router();

dashboardRouter.route("/get_user_summary").get(isUserAuthenticated, isUserAuthenticated, getUsersSummaryData);
dashboardRouter.route("/get_product_summary").get(isUserAuthenticated, isUserAuthenticated, getProductsSummaryData);
dashboardRouter.route("/get_brand_category_stock").get(isUserAuthenticated, isUserAuthenticated, getBrandToCategoryStockData);
dashboardRouter.route("/get_outstocked_products").get(isUserAuthenticated, isUserAuthenticated, getAllOutStockedProducts);
dashboardRouter.route("/get_order_summary").get(isUserAuthenticated, isUserAuthenticated, getOrderSummaryData);

export default dashboardRouter;