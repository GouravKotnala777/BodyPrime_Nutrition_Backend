import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/classes.js";
import Wishlist from "../models/wishlist.model.js";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { sendSuccessResponse } from "../utils/functions.js";


export async function addToWishlist(req:Request, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        const {productID} = req.body;

        console.log(productID);
        
        if (!productID) return next(new ErrorHandler("productID not found", 400));

        
        const isListExist = await Wishlist.findOne({userID});
        
        let isProductAlreadyAdded:boolean|null = null;
        if (isListExist) {
            isProductAlreadyAdded = isListExist.products.some((p) => p.toString() === productID);
            
            const updatedBody = isProductAlreadyAdded ?
            {$pull:{products:productID}}
                :
                {$push:{products:productID}};

            const updatedCart = await Wishlist.findByIdAndUpdate(isListExist._id, updatedBody);
            
            if (!updatedCart) return next(new ErrorHandler("Internal Server Error", 500));
        }
        else{
            const newCart = await Wishlist.create({
                userID,
                products:[productID]
            });
            if (!newCart) return next(new ErrorHandler("Internal Server Error", 500));
        }
        
        const resMessage = isProductAlreadyAdded?"removed from wishlist":"add to wishlist";
        const resObj = isProductAlreadyAdded?{productID, operation:-1}:{productID, operation:1};
        
        sendSuccessResponse(res, resMessage, resObj, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};