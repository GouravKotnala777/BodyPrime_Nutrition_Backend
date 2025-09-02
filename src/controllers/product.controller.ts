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

            nutritionFacts:{
                servingSize,
                servingsPerContainer,
                protein,
                carbs,
                fat,
                calories
            }
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
};

export async function addImages(req:Request, res:Response, next:NextFunction) {
    try {
        const productID = req.body;

        if (!productID) return next(new ErrorHandler("productID not found", 404));
        if (!req.files || req.files.length === 0) return next(new ErrorHandler("no image uploaded thik hai", 400));

        
        const files = (req.files as Express.Multer.File[]);
        const filePath = files.map((file) => `/uploads/${file.filename}`);
        console.log({files});
        console.log({filePath});

        if (filePath.length === 0) return next(new ErrorHandler("files array is empty", 400));
        
        const selectedProduct = await Product.findByIdAndUpdate(productID, {
            images:filePath
        });
        
        if (!selectedProduct) return next(new ErrorHandler("selectedProduct not found", 404));

        const product = selectedProduct.toObject();

        sendSuccessResponse(res, "Images uploaded successfully", {...product}, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function updateProduct(req:Request, res:Response, next:NextFunction) {
    try {
        const {
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
            calories,

            flavor,
            warning
        } = req.body;
        const productID = req.query;

        if (!name &&
            !price &&
            !brand &&
            !category &&
            !size &&
            !tag &&
            !description &&
            !stock &&
            !weight &&
            !ingredients &&

            !servingSize &&
            !servingsPerContainer &&
            !protein &&
            !carbs &&
            !fat &&
            !calories &&

            !flavor &&
            !warning) return next(new ErrorHandler("Did not provide any field", 400));
        if (!productID) return next(new ErrorHandler("ProductID not found", 404));

        const findProductAndUpdate = Product.findByIdAndUpdate(productID, {
            ...(name&&{name}),
            ...(price&&{price}),
            ...(brand&&{brand}),
            ...(category&&{category}),
            ...(size&&{size}),
            ...(tag&&{tag}),
            ...(description&&{description}),
            ...(stock&&{stock}),
            ...(weight&&{weight}),
            ...(ingredients&&{ingredients}),

            ...(servingSize&&{servingSize}),
            ...(servingsPerContainer&&{servingsPerContainer}),
            ...(protein&&{protein}),
            ...(carbs&&{carbs}),
            ...(fat&&{fat}),
            ...(calories&&{calories}),

            ...(flavor&&{flavor}),
            ...(warning&&{warning})
        });
        
        if (!findProductAndUpdate) return next(new ErrorHandler("Internal Server Error", 500));

        sendSuccessResponse(res, "Product pdated successfully", {...findProductAndUpdate}, 200);
    } catch (error) {
        console.log(error);
        throw new ErrorHandler("Koi problem aa gai", 500);
    }
}