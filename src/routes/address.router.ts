import express from "express";
import { isUserAuthenticated } from "../middlewares/middlewares.js";
import { createAddress, deleteMyAddress, getMyAddressess } from "../controllers/address.controller.js";

const addressRouter = express.Router();

addressRouter.route("/get_my_addresses").get(isUserAuthenticated, getMyAddressess);
addressRouter.route("/create_address").post(isUserAuthenticated, createAddress);
addressRouter.route("/delete_my_address").delete(isUserAuthenticated, deleteMyAddress);

export default addressRouter;