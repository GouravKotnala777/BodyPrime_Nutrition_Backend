import { NextFunction, Request, Response } from "express";
import Order from "../models/order.model.js";
import { sendSuccessResponse } from "../utils/functions.js";
import User from "../models/user.model.js";
import Product, { CategoryTypes } from "../models/product.model.js";
import { ErrorHandler } from "../utils/classes.js";

type DateRangeType = "today" | "week" | "month" | "custom";
function getDateRange(
    range: string,
    customStartDate?: string,
    customEndDate?: string
): { startDate: Date; endDate: Date } {

    const now = new Date();

    if (range === "today") {
        return {
            startDate: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            ),
            endDate: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
            )
        };
    }

    if (range === "week") {
        const day = now.getDay();

        return {
            startDate: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - day
            ),
            endDate: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - day + 7
            )
        };
    }

    if (range === "month") {
        return {
            startDate: new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            ),
            endDate: new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                1
            )
        };
    }

    if (range === "custom" && customStartDate && customEndDate) {
        const startDate = new Date(`${customStartDate}T00:00:00`);
        const endDate = new Date(`${customEndDate}T00:00:00`);

        endDate.setDate(endDate.getDate() + 1);

        return { startDate, endDate };
    }

    throw new Error("Invalid date range");
}


export async function getUsersSummaryData(req:Request<{},{},{},{}>, res:Response, next:NextFunction) {
    try {
        
        const userSummaryData = await User.aggregate([
            {
                $group:{
                    _id:"$isVerified", count:{$sum:1}
                }
            },
            {
                $group:{
                    _id:null,
                    data:{
                        $push:{_id:"$_id", count:"$count"}
                    },
                    totalUsers:{$sum:"$count"}
                }
            }
        ]);

        

        sendSuccessResponse(res, "", userSummaryData, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export async function getProductsSummaryData(req:Request<{},{},{},{}>, res:Response, next:NextFunction) {
    try {
        const productSummaryData = await Product.aggregate([
            {
                $group:{
                    _id:"$category",
                    count:{$sum:1}
                }
            },
            {
                $group:{
                    _id:null,
                    data:{
                        $push:{k:"$_id", v:"$count"}
                    },
                    totalProducts:{$sum:"$count"}
                }
            },
            {
                $project:{
                    _id:0,
                    data:{$arrayToObject:"$data"},
                    totalProducts:1
                }
            }
        ]);
        

        sendSuccessResponse(res, "", productSummaryData, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export async function getBrandToCategoryStockData(req:Request<{},{},{},{category:CategoryTypes}>, res:Response, next:NextFunction) {
    try {
        const {category} = req.query;
        if (!category) {
            return next(new ErrorHandler("category query is undefined", 404));
        }
        const result = await Product.find({category}, "brand stock");
        //console.log(result);
        
        //const productSummaryData = await Product.aggregate([
        //    {
        //        $group:{
        //            _id:"$category",
        //            count:{$sum:1}
        //        }
        //    },
        //    {
        //        $group:{
        //            _id:null,
        //            data:{
        //                $push:{k:"$_id", v:"$count"}
        //            },
        //            totalProducts:{$sum:"$count"}
        //        }
        //    },
        //    {
        //        $project:{
        //            _id:0,
        //            data:{$arrayToObject:"$data"},
        //            totalProducts:1
        //        }
        //    }
        //]);
        

        sendSuccessResponse(res, "", result, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export async function getAllOutStockedProducts(req:Request<{},{},{},{}>, res:Response, next:NextFunction) {
    try {
        //if (!category) {
        //    return next(new ErrorHandler("category query is undefined", 404));
        //}
        const result = await Product.find({
            outOfStocked:{
                $not:{$size:0}
            }
        }, "outOfStocked"); // take _id brand category sub directly
        //console.log(result);
        
        //const productSummaryData = await Product.aggregate([
        //    {
        //        $group:{
        //            _id:"$category",
        //            count:{$sum:1}
        //        }
        //    },
        //    {
        //        $group:{
        //            _id:null,
        //            data:{
        //                $push:{k:"$_id", v:"$count"}
        //            },
        //            totalProducts:{$sum:"$count"}
        //        }
        //    },
        //    {
        //        $project:{
        //            _id:0,
        //            data:{$arrayToObject:"$data"},
        //            totalProducts:1
        //        }
        //    }
        //]);
        

        sendSuccessResponse(res, "", result, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function getOrderSummaryData(req:Request<{},{},{},{range:DateRangeType; startDateParam:string; endDateParam:string;}>, res:Response, next:NextFunction) {
    try {
        const {range, startDateParam, endDateParam} = req.query;

        const {startDate, endDate} = getDateRange(range, startDateParam, endDateParam);

        const result = await Order.aggregate([
            {
                $match:{
                    $or:[
                        {orderStatus:"pending", createdAt:{$gte:startDate, $lt:endDate}},
                        {
                            orderStatus:{
                                $in:["processing", "shipped", "delivered", "cancelled"]
                            },
                            updatedAt:{$gte:startDate, $lt:endDate}
                        },
                    ]
                }
            },
            {
                $group:{
                    _id:"$orderStatus", count:{$sum:1}
                }
            },
            {
                $group:{
                    _id:null,
                    data:{
                        $push:{
                            _id:"$_id",
                            count:"$count"
                        }
                    },
                    totalOrders:{
                        $sum:"$count"
                    }
                }
            },
            {
                $project:{
                    _id:0,
                    data:1,
                    totalOrders:1
                }
            }
        ]);

        sendSuccessResponse(res, "", result, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};