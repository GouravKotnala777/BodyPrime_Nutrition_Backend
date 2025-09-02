import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/classes.js";
import Product from "../models/product.model.js";
import { sendSuccessResponse } from "../utils/functions.js";


export async function createProduct(req:Request, res:Response, next:NextFunction) {
    try {
        const {
            name,
            price,
            brand,
            category,
            size,
            tag,
            description,
            images,
            stock,
            weight,
            ingredients,

            servingSize,
            servingsPerContainer,
            protein,
            carbs,
            fat,
            calories,

            rating,
            numReviews,
            flavor,
            warning
        } = req.body;

        if (
            !name ||
            !price ||
            !brand ||
            !category ||
            !size ||
            !tag ||
            !description ||
            !stock ||
            !weight ||
            !ingredients ||

            !servingSize ||
            !servingsPerContainer ||
            !protein ||
            !carbs ||
            !fat ||
            !calories
        ) return next(new ErrorHandler("All fields are required", 404));

        const newProduct = await Product.create({
            name,
            price,
            brand,
            category,
            size,
            tag,
            description,
            stock,
            weight,
            ingredients,

            servingSize,
            servingsPerContainer,
            protein,
            carbs,
            fat,
            calories
        });

        if (!newProduct) return next(new ErrorHandler("Internal Server Error", 500));

        const product = newProduct.toObject();

        sendSuccessResponse(res, "Product created successfully", {...product}, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function allProducts(req:Request, res:Response, next:NextFunction) {
    try {
        const limit = 2;
        const {skip=0} = req.query;

        const allProducts = await Product.find().skip(Number(skip)*limit).limit(limit);

        const resMessage = (allProducts.length === 0) ? "No product yet!" : "All products";
        sendSuccessResponse(res, resMessage, {...allProducts}, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
}