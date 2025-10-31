import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/classes.js";
import Product, { ProductTypes } from "../models/product.model.js";
import { sendSuccessResponse } from "../utils/functions.js";


export async function getProducts(req:Request<{}, {}, {}, {skip:number; searchField:"name"|"category"|"brand"|"soldCount"|"returnCount"; searchQuery:string;}>, res:Response, next:NextFunction) {
    try {
        const limit = 1;
        const {skip=0, searchField, searchQuery} = req.query;

        const findWith = (!searchField||!searchQuery) ?
            {}
            :
            //(searchField === "soldCount") ?
            //    {}
            //    :
                {[searchField]:{
                    $regex:searchQuery,
                    $options:"i"
                }};

        const allProducts = await Product.find(findWith)
        .skip(Number(skip)*limit)
        .limit(limit)
        .sort({...(searchField==="soldCount"&&{soldCount:-1})});

        const resMessage = (allProducts.length === 0) ? "No product yet!" : "All products";
        sendSuccessResponse(res, resMessage, allProducts, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function searchProducts(req:Request, res:Response, next:NextFunction) {
    try {
        const {searchQuery} = req.query;

        if (!searchQuery || typeof searchQuery !== "string") {
            return next(new ErrorHandler("searchQuery is required", 400));
        }

        const [names, categories, brands, tags] = await Promise.all([
            Product.find({
                name:{
                    $regex:searchQuery,
                    $options:"i"
                }
            }).select("_id name brand category"),
            Product.find({
                category:{
                    $regex:searchQuery,
                    $options:"i"
                }
            }).select("_id name brand category"),
            Product.find({
                brand:{
                    $regex:searchQuery,
                    $options:"i"
                }
            }).select("_id name brand category"),
            Product.find({
                tag:{$in:[searchQuery]}
            }).select("_id name brand category tag")
        ]);

        sendSuccessResponse(res, "", {names, categories, brands, tags}, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function getSingleProduct(req:Request, res:Response, next:NextFunction) {
    try {
        const {productID} = req.params;
        
        if (!productID) return next(new ErrorHandler("productID not found", 404));
        
        const selectedProduct = await Product.findById(productID);
        
        if (!selectedProduct) return next(new ErrorHandler("selectedProduct not found", 404));

        sendSuccessResponse(res, "Single product", selectedProduct.toObject(), 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

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
        const {productID} = req.query;

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

        const findProductAndUpdate = await Product.findByIdAndUpdate(productID, {
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

        sendSuccessResponse(res, "Product pdated successfully", findProductAndUpdate, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function deleteProduct(req:Request, res:Response, next:NextFunction) {
    try {
        const {productID} = req.query;

        if (!productID) return next(new ErrorHandler("ProductID not found", 404));

        const findProductAndDelete = await Product.findByIdAndDelete(productID);        
        
        if (!findProductAndDelete) return next(new ErrorHandler("Internal Server Error", 500));

        sendSuccessResponse(res, "Product deleted successfully", findProductAndDelete, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function addImages(req:Request, res:Response, next:NextFunction) {
    try {
        const {productID} = req.body;

        if (!productID) return next(new ErrorHandler("productID not found", 404));
        if (!req.files || req.files.length === 0) return next(new ErrorHandler("no image uploaded thik hai", 400));

        
        const files = (req.files as Express.Multer.File[]);
        const filePath = files.map((file) => `/public/${file.filename}`);

        if (filePath.length === 0) return next(new ErrorHandler("files array is empty", 400));
        
        const selectedProduct = await Product.findByIdAndUpdate(productID, {
            images:filePath
        }, {new:true});
        
        if (!selectedProduct) return next(new ErrorHandler("selectedProduct not found", 404));

        const product = selectedProduct.toObject();

        sendSuccessResponse(res, "Images uploaded successfully", {images:product.images||[]}, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function createProduct(req:Request, res:Response, next:NextFunction) {
    try {
        const {
            name,
            price,
            brand,
            category,
            size,
            weight,
            
            flavor,
            warning,
            tag
        } = req.body;

        if (
            !name ||
            !price ||
            !brand ||
            !category ||
            !size ||
            !tag ||
            !weight
        ) return next(new ErrorHandler("All fields are required", 404));

        const newProduct = await Product.create({
            name,
            price,
            brand,
            category,
            size,
            tag,
            weight,
            flavor,
            warning
        });

        if (!newProduct) return next(new ErrorHandler("Internal Server Error", 500));

        const product = newProduct.toObject();

        sendSuccessResponse(res, "Product created successfully", {...product}, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};