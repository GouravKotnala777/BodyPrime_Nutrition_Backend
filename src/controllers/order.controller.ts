import { NextFunction, Request, Response } from "express";
import { generateRandomCode, sendEmail, sendSuccessResponse } from "../utils/functions.js";
import Order, { OrderTypesPopulates, PaymentStatusType } from "../models/order.model.js";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { ErrorHandler } from "../utils/classes.js";
import Stripe from "stripe";
import Cart from "../models/cart.model.js";
import { Document } from "mongoose";

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

export async function allOrders(req:Request, res:Response, next:NextFunction) {
    try {
        const [pending, processing, shipped, delivered, cancelled] = await Promise.all([
            Order.find({
                orderStatus:"pending"
            }).sort({updatedAt:-1}),
            Order.find({
                orderStatus:"processing"
            }).sort({updatedAt:-1}),
            Order.find({
                orderStatus:"shipped"
            }).sort({updatedAt:-1}),
            Order.find({
                orderStatus:"delivered"
            }).sort({updatedAt:-1}),
            Order.find({
                orderStatus:"cancelled"
            }).sort({updatedAt:-1})
        ]);

        sendSuccessResponse(res, "All orders", {pending, processing, shipped, delivered, cancelled}, 200);
    } catch (error) {
        console.log(error);
        next(error);        
    }
};

export async function sendDeliveryConfirmation(req:Request, res:Response, next:NextFunction) {
    try {
        const {orderID} = req.body;

        if (!orderID) return next(new ErrorHandler("orderID not found", 404));
        
        const selectedOrder = await Order.findById(orderID).populate({path:"userID", model:"User", select:"_id name email mobile"}) as (Document<unknown, {}, OrderTypesPopulates>&OrderTypesPopulates) |null;
        
        if (!selectedOrder) return next(new ErrorHandler("order not found", 404));

        const OTP = await generateRandomCode(6);

        const emailRes = await sendEmail({
            to:selectedOrder.userID.email,
            subject:"OTP for order delivery confirmation",
            html:`
                <html>
                    <head><title>delivery confirmation</title></head>
                    <body>
                        <h1>OTP for order delivery confirmation</h1>
                        <p>${OTP}</p>
                    </body>
                </html>
            `,
            text:"sdfghjkl"
        });

        if (!emailRes) return next(new ErrorHandler("email not sent", 500));
        
        //selectedOrder.otp = OTP;
        //await selectedOrder.save();

        const updateOrder = await Order.findByIdAndUpdate(orderID, {
            otp:OTP,
            otpExpiryTime:new Date(Date.now()+1000*60*1)
        });
        
        if (!updateOrder) return next(new ErrorHandler("Internal Server Error", 500));

        sendSuccessResponse(res, "email has been sended", {}, 200);
    } catch (error) {
        console.log(error);
        next(error);        
    }
};

export async function verifyDeliveryConfirmation(req:Request, res:Response, next:NextFunction) {
    try {
        const {orderID, otp} = req.body;

        if (!orderID) return next(new ErrorHandler("orderID not found", 404));
        if (!otp) return next(new ErrorHandler("OTP not found", 404));
        
        const selectedOrder = await Order.findOne({
            _id:orderID,
            otp,
            otpExpiryTime:{$gte:new Date()}
        }).populate({path:"userID", model:"User", select:"_id name email mobile"}) as (Document<unknown, {}, OrderTypesPopulates>&OrderTypesPopulates) |null;
        
        if (!selectedOrder) return next(new ErrorHandler("order not found", 404));
        
        selectedOrder.otp = "";
        selectedOrder.otpExpiryTime = null;
        selectedOrder.orderStatus = "delivered";
        selectedOrder.deliveredAt = new Date();
        const updatedOrder = await selectedOrder.save();
        
        if (!updatedOrder) return next(new ErrorHandler("Internal Server Error", 500));
        
        const emailRes = await sendEmail({
            to:selectedOrder.userID.email,
            subject:"Thanks for using our service",
            html:`
                <html>
                    <head><title>Thanks message</title></head>
                    <body>
                        <h1>Thanks for using our service</h1>
                        <p>Enjoy your meal</p>
                    </body>
                </html>
            `,
            text:"sdfghjkl"
        });

        sendSuccessResponse(res, "Order confirmation success", {}, 201);
    } catch (error) {
        console.log(error);
        next(error);        
    }
};

export async function myOrders(req:Request, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        
        const myOrders = await Order.find({
            userID
        });


        //if (myOrders) return next(new Error("Internal server error"));
                
        sendSuccessResponse(res, "My orders", myOrders, 200);
    } catch (error) {
        console.log(error);
        next(error);        
    }
};

export async function createOrder(req:Request, res:Response, next:NextFunction) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion:"2025-08-27.basil"
        });
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


        let paymentIntent:Stripe.Response<Stripe.PaymentIntent>|null = null;
        if (method === "Stripe") {
            paymentIntent = await stripe.paymentIntents.create({
                amount:Math.round(totalPrice*100),
                currency:"inr",
                automatic_payment_methods:{enabled:true}
            });
    
            if (paymentIntent.status === "canceled") {
                return next(new ErrorHandler("Payment was canceled", 400));
            };
        }

        const newOrder = await Order.create({
            userID,
            products,
            orderStatus:"pending",
            paymentInfo:{method, transactionID, status},
            priceSummary:{itemsPrice, taxPrice, shippingPrice, discount, totalPrice},
            shippingInfo:{address, city, state, country, pincode, phone}
        });

        if (!newOrder) return next(new Error("Internal server error"));
                
        sendSuccessResponse(res, "Order successfull", {clientSecret:paymentIntent?.client_secret, newOrder}, 201);
    } catch (error) {
        console.log(error);
        next(error);        
    }
};

export async function updateOrder(req:Request<{},{},{transactionID:string; status:PaymentStatusType; message:string|null; error?:string;}>, res:Response, next:NextFunction) {
    try {
        const {orderID} = req.query;
        const {transactionID, status, message, error} = req.body;

        if (!orderID) return next(new ErrorHandler("OrderID not found", 404));

        const findOrderByIdAndUpdate = await Order.findByIdAndUpdate(orderID, {
            ...(transactionID&&{"paymentInfo.transactionID":transactionID}),
            ...(status&&{"paymentInfo.status":status}),
            ...(message&&{"paymentInfo.message":message}),
            ...(error&&{"paymentInfo.error":error})
        });

        if (!findOrderByIdAndUpdate) return next(new ErrorHandler("Internal server error", 500));

        if (status === "succeeded") {
            await Cart.findOneAndUpdate({
                userID:findOrderByIdAndUpdate.userID
            }, {products:[], totalPrice:0});
        }

        sendSuccessResponse(res, "order updated for success", {orderID, method:"Stripe", transactionID, status, message, error}, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};