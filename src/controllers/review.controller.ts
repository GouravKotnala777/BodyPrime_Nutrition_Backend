import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import { ErrorHandler } from "../utils/classes.js";
import Review from "../models/review.model.js";
import { sendSuccessResponse } from "../utils/functions.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";


export async function createReview(req:Request, res:Response, next:NextFunction) {
    try {
        const {rating, comment} = req.body;
        const userID = (req as AuthenticatedRequest).user.id;
        const {productID} = req.params;

        if (!rating) return next(new ErrorHandler("rating is required", 400));
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        if (!productID) return next(new ErrorHandler("productID not found", 404));
        
        const isReviewExist = await Review.findOne({
            userID, productID
        });

        const isVerifiedPurchase = !!(await Order.exists({
            userID,
            "products.productID":{$in:[productID]},
            orderStatus:"delivered"
        }));
        
        if (isReviewExist) {
            const oldRating = isReviewExist.rating;
            const newRating = rating;

            isReviewExist.rating = rating;
            isReviewExist.comment = (comment||isReviewExist.comment);
            isReviewExist.isVerifiedPurchase = isVerifiedPurchase;
            
            const findProductAndUpdate = await Product.findByIdAndUpdate(productID, [{
                $set:{
                    rating:{$add:["$rating", newRating - oldRating]},
                    avgRating:{
                        $divide:[
                            {$add:["$rating", newRating - oldRating]},
                            "$numReviews"
                        ]
                    }
                }
            }], {new:true});
            if (!findProductAndUpdate) return next(new ErrorHandler("Internal Server Error", 500));

            const updatedReview = await isReviewExist.save();

            sendSuccessResponse(res, "Review updated successfully", updatedReview, 201);
        }
        else{
            const newReview = await Review.create({
                userID, productID, rating, comment, isVerifiedPurchase
            });

            if (!newReview) return next(new ErrorHandler("Internal Server Error", 500));

            const findProductAndUpdate = await Product.findByIdAndUpdate(productID, [{
                $set:{
                    rating:{$add:["$rating", rating]},
                    numReviews:{$add:["$numReviews", 1]},
                    avgRating:{$divide:[
                        {$add:["$rating", rating]},
                        {$add:["$numReviews", 1]}
                    ]}
                }
            }], {new:true});
            sendSuccessResponse(res, "Review created successfully", newReview, 201);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function getReviews(req:Request, res:Response, next:NextFunction) {
    try {
        const {productID} = req.params;

        if (!productID) return next(new ErrorHandler("productID not found", 404));
        
        const allReviews = await Review.find({
            productID
        }).populate("userID", "name", "User");

        sendSuccessResponse(res, "Products all reviews", allReviews, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};
