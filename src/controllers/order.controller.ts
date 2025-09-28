import { NextFunction, Request, Response } from "express";
import { sendSuccessResponse } from "../utils/functions.js";
import Order from "../models/order.model.js";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { ErrorHandler } from "../utils/classes.js";

interface OrderRequestType extends AuthenticatedRequest  {
    products: {
        productID:string;
        name:string;
        price:number;
        quantity: number;
    }[];
    shippingInfo: {
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        phone: string;
    };
    paymentInfo: {
        method: "COD" | "Stripe";
        transactionID?: string;
        status: "pending" | "paid" | "failed" | "refunded";
    };
    priceSummary: {
        itemsPrice: number;
        taxPrice: number;
        shippingPrice: number;
        discount: number;
        totalPrice: number;
    };
    orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    deliveredAt?: Date;
};

export async function createOrder(req:Request, res:Response, next:NextFunction) {
    try {
        const {
            products,
            address, city, state, country, pincode,
            phone,
            method, transactionID, status,
            itemsPrice, taxPrice, shippingPrice, discount, totalPrice,
            orderStatus
        }:{
            products:{
                productID:string;
                name:string;
                price:number;
                quantity: number;
            }[];
            address:string; city:string; state:string; country:string; pincode:string;
            phone:string;
            method:"COD"|"Stripe"; transactionID?:string; status:"pending"|"paid"|"failed"|"refunded";
            itemsPrice:number; taxPrice:number; shippingPrice:number; discount:number; totalPrice:number;
            orderStatus:"pending"|"processing"|"shipped"|"delivered"|"cancelled";
            deliveredAt:Date;
        } = req.body;

        if (!products || products.length === 0) return next(new ErrorHandler("no product found", 404));
        if (
            !address || !city || !state || !country || !pincode ||
            !phone ||
            !method || !status ||
            !itemsPrice || !totalPrice ||
            !orderStatus
        ) return next(new ErrorHandler("All fields are required", 400));

        const userID = (req as AuthenticatedRequest).user.id;

        const newOrder = await Order.create({
            userID,
            products,
            orderStatus:"pending",
            paymentInfo:{method, transactionID, status},
            priceSummary:{itemsPrice, taxPrice, shippingPrice, discount, totalPrice},
            shippingInfo:{address, city, state, country, pincode, phone}
        });

        if (!newOrder) return next(new Error("Internal server error"));
                
        sendSuccessResponse(res, "Order successfull", newOrder, 201);
    } catch (error) {
        console.log(error);
        next(error);        
    }
}