import { NextFunction, Request, Response } from "express";
import Cart, { CartTypesPopulates } from "../models/cart.model.js";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { ErrorHandler } from "../utils/classes.js";
import { sendSuccessResponse } from "../utils/functions.js";
import { Document } from "mongoose";
import Product from "../models/product.model.js";
import Variant from "../models/variant.model.js";



export async function getCart(req:Request, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        
        const cart = await Cart.findOne({userID})
            .populate({path:"products.productID", select:"_id name brand category images", model:"Product"}) as (Document<unknown, any, CartTypesPopulates>&CartTypesPopulates)|null;
            //.populate({path:"products.variantID", select:" price weight flavor images", model:"Variant"}) as (Document<unknown, any, CartTypesPopulates>&CartTypesPopulates)|null;
        
        if (!cart) return next(new ErrorHandler("cart not found", 404));
        
        sendSuccessResponse(res, "cart data fetched", cart, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function addToCart(req:Request<{}, {}, {productID:string; variant:string; quantity:number;}>, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        const {productID, variant, quantity} = req.body;
        
        const cart = await Cart.findOne({
            userID
        });

        if (!productID || !variant || !quantity) return next(new ErrorHandler("productID or quantity not found", 400));
        
        const selectedProduct = await Product.findById(productID);
        //const selectedVariant = await Variant.findById(products.variant);
        
        if (!selectedProduct) return next(new ErrorHandler("selectedProduct not found", 404));
        //if (!selectedVariant) return next(new ErrorHandler("selectedProduct not found", 404));

        // variant = productID # flavor # weight # price
        const price = Number(variant.split("#")[3]);        

        if (cart) {
            const isProductAlreadyAdded = cart.products.find((p) => (p.productID._id.toString() === productID && p.variant === variant));

            if (isProductAlreadyAdded) {
                const updatedQuantity = (isProductAlreadyAdded.quantity + quantity);
                const updatedTotalCartPrice = (cart.totalPrice + (quantity*price));

                isProductAlreadyAdded.quantity = updatedQuantity;
                cart.totalPrice = updatedTotalCartPrice;                

                const updatedCart = await cart.save();
                if (!updatedCart) return next(new ErrorHandler("Internal server error", 500));

                const productForRes = {products:selectedProduct, variant, quantity:updatedQuantity};
                
                sendSuccessResponse(res, "Product added to cart 1", productForRes, 201);
            }
            else{
                const findCartAndUpdate = await Cart.findByIdAndUpdate(cart._id, {
                    $push:{
                        products:{productID, variant, quantity}
                    },
                    $inc:{totalPrice:(quantity*price)}
                }, {new:true}).populate("products.productID", "_id, name, brand, category, price, weight, flavor, images, size", "Product") as (Document<unknown, any, CartTypesPopulates>&CartTypesPopulates)|null;

                if (!findCartAndUpdate) return next(new ErrorHandler("Internal server error", 500));

                const productForRes = {products:selectedProduct, variant, quantity};                
                
                sendSuccessResponse(res, "Product added to cart 2", productForRes, 201);
            }
        }
        else{
            const totalPrice = price*quantity;
            const createNewCart = await Cart.create({
                userID,
                products:[{productID, variant, quantity}],
                totalPrice
            });
    
            if (!createNewCart) return next(new ErrorHandler("Internal server error", 500));

            const productForRes = {products:selectedProduct, variant, quantity};            
            
            sendSuccessResponse(res, "Product added to cart 3", productForRes, 201);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function removeFromCart(req:Request<{}, {}, {productID:string; variant:string; quantity:number;}>, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        const {productID, variant, quantity} = req.body;

        const cart = await Cart.findOne({
            userID
        });

        if (!productID || !variant || !quantity) return next(new ErrorHandler("productID or quantity not found", 400));
        
        const selectedProduct = await Product.findById(productID);
        //const selectedVariant = await Variant.findById(variantID);
        
        if (!selectedProduct) return next(new ErrorHandler("selectedProduct not found", 404));
        //if (!selectedVariant) return next(new ErrorHandler("selectedProduct not found", 404));
        
        // variant = productID # flavor # weight # price
        const price = Number(variant.split("#")[3]);
        
        if (!cart) return next(new ErrorHandler("cart not found", 404));
        
        const findResult = cart.products.find((p) => (p.productID.toString() === productID && p.variant===variant));

        if (!findResult) return next(new ErrorHandler("findResult not found", 404));
        
        if (findResult.quantity-quantity >= 1) {
            const updatedQuantity = (findResult.quantity-quantity);
            const updatedTotalCartPrice = (cart.totalPrice - (price*quantity));
            findResult.quantity = updatedQuantity;
            cart.totalPrice = updatedTotalCartPrice;
            await cart.save();
            sendSuccessResponse(res, "Product removed from cart", {products:selectedProduct._id, variant, quantity:updatedQuantity}, 201);
        }
        else{
            const updatedCart = await Cart.findByIdAndUpdate(cart._id, {
                $pull:{
                    products:{productID, variant},
                },
                $inc:{totalPrice:-(price*findResult.quantity)}
            }, {new:true});
            
            if (!updatedCart) return next(new ErrorHandler("updatedCart not found", 404));

            sendSuccessResponse(res, "Product removed from cart2", {products:selectedProduct._id, variant, quantity:0}, 201);            
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};