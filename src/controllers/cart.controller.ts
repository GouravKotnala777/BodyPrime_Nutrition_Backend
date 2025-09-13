import { NextFunction, Request, Response } from "express";
import Cart from "../models/cart.model.js";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { ErrorHandler } from "../utils/classes.js";
import { sendSuccessResponse } from "../utils/functions.js";
import mongoose from "mongoose";
import Product from "../models/product.model.js";


export async function addToCart(req:Request<{}, {}, {products:{productID:string; quantity:number;}}>, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        const {products} = req.body;
        const cart = await Cart.findOne({
            userID
        });

        if (!products.productID || !products.quantity) return next(new ErrorHandler("productID or quantity not found", 400));
        
        const selectedProduct = await Product.findById(products.productID);
        
        if (!selectedProduct) return next(new ErrorHandler("selectedProduct not found", 404));

        const price = selectedProduct.price;

        if (cart) {
            const isProductAlreadyAdded = cart.products.find((p) => p.productID.toString() === products.productID);

            if (isProductAlreadyAdded) {
                isProductAlreadyAdded.quantity += products.quantity;
                cart.totalPrice += (products.quantity*price);
            }
            else{
                cart.products.push({
                    productID:new mongoose.Types.ObjectId(products.productID),
                    quantity:products.quantity
                });
                cart.totalPrice += (products.quantity*price);

            }
            const updatedCart = await cart.save();
            sendSuccessResponse(res, "Product added successfully", updatedCart, 201);
        }
        else{
            const totalPrice = price*products.quantity;
            const createNewCart = await Cart.create({
                userID,
                products:[products],
                totalPrice
            });
    
            if (!createNewCart) return next(new ErrorHandler("Internal server error", 500));
            
            const cartData = createNewCart.toObject();
    
            sendSuccessResponse(res, "Product added to cart", cartData, 201);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};