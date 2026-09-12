import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/classes.js";
import Wishlist, { WishlistTypesPopulates } from "../models/wishlist.model.js";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { sendSuccessResponse } from "../utils/functions.js";
import { Document } from "mongoose";


export async function getWishlist(req:Request, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        
        const myWishlist = await Wishlist.findOne({userID})
        .populate({path:"products.productID", select:"_id name brand category images", model:"Product"}) as (Document<unknown, any, WishlistTypesPopulates>&WishlistTypesPopulates)|null;
        if (!myWishlist) return next(new ErrorHandler("Internal Server Error", 500));

        sendSuccessResponse(res, "", myWishlist, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function addToWishlist(req:Request, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        const {productID, variant} = req.body;
        
        if (!productID) return next(new ErrorHandler("productID not found", 400));

        
        const isListExist = await Wishlist.findOne({userID});
        
        let isProductAlreadyAdded:boolean|null = null;
        if (isListExist) {
            isProductAlreadyAdded = isListExist.products.some((p) => (p.productID.toString() === productID && p.variant === variant));
            
            const updatedBody = isProductAlreadyAdded ?
            {$pull:{products:{productID, variant}}}
                :
                {$push:{products:{productID, variant}}};

            const updatedCart = await Wishlist.findByIdAndUpdate(isListExist._id, updatedBody);
            
            if (!updatedCart) return next(new ErrorHandler("Internal Server Error", 500));
        }
        else{
            const newCart = await Wishlist.create({
                userID,
                products:[{
                    productID, variant
                }]
            });
            if (!newCart) return next(new ErrorHandler("Internal Server Error", 500));
        }
        
        const resMessage = isProductAlreadyAdded?"removed from wishlist":"add to wishlist";
        const resObj = isProductAlreadyAdded?{productID, variant, operation:-1}:{productID, variant, operation:1};
        
        sendSuccessResponse(res, resMessage, resObj, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};