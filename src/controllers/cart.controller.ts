import { NextFunction, Request, Response } from "express";
import Cart, { CartTypesPopulates } from "../models/cart.model.js";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { ErrorHandler } from "../utils/classes.js";
import { sendSuccessResponse } from "../utils/functions.js";
import { Document } from "mongoose";
import Product from "../models/product.model.js";



export async function getCart(req:Request, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        
        const cart = await Cart.findOne({userID}).populate({path:"products.productID", select:"_id name brand category price weight flavor images size", model:"Product"}) as (Document<unknown, any, CartTypesPopulates>&CartTypesPopulates)|null;
        
        if (!cart) return next(new ErrorHandler("cart not found", 404));
        
        sendSuccessResponse(res, "cart data fetched", cart, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function addToCart(req:Request<{}, {}, {productID:string; quantity:number;}>, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        const products = req.body;
        const cart = await Cart.findOne({
            userID
        });

        if (!products.productID || !products.quantity) return next(new ErrorHandler("productID or quantity not found", 400));
        
        const selectedProduct = await Product.findById(products.productID);
        
        if (!selectedProduct) return next(new ErrorHandler("selectedProduct not found", 404));

        const price = selectedProduct.price;

        if (cart) {
            const isProductAlreadyAdded = cart.products.find((p) => p.productID._id.toString() === products.productID);

            if (isProductAlreadyAdded) {
                const updatedQuantity = (isProductAlreadyAdded.quantity + products.quantity);
                const updatedTotalCartPrice = (cart.totalPrice + (products.quantity*price));

                isProductAlreadyAdded.quantity = updatedQuantity;
                cart.totalPrice = updatedTotalCartPrice;

                const updatedCart = await cart.save();
                if (!updatedCart) return next(new ErrorHandler("Internal server error", 500));

                const productForRes = {products:selectedProduct, quantity:updatedQuantity};
                
                sendSuccessResponse(res, "Product added to cart 1", productForRes, 201);
            }
            else{
                const findCartAndUpdate = await Cart.findByIdAndUpdate(cart._id, {
                    $push:{
                        products
                    },
                    $inc:{totalPrice:(products.quantity*price)}
                }, {new:true}).populate("products.productID", "_id, name, brand, category, price, weight, flavor, images, size", "Product") as (Document<unknown, any, CartTypesPopulates>&CartTypesPopulates)|null;

                if (!findCartAndUpdate) return next(new ErrorHandler("Internal server error", 500));

                const productForRes = {products:selectedProduct, quantity:products.quantity};
                
                sendSuccessResponse(res, "Product added to cart 2", productForRes, 201);
            }
        }
        else{
            const totalPrice = price*products.quantity;
            const createNewCart = await Cart.create({
                userID,
                products:[products],
                totalPrice
            });
    
            if (!createNewCart) return next(new ErrorHandler("Internal server error", 500));

            const productForRes = {products:selectedProduct, quantity:products.quantity};
            
            sendSuccessResponse(res, "Product added to cart 3", productForRes, 201);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};