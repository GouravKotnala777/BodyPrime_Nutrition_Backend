import { NextFunction, Request, Response } from "express";
import Order from "../models/order.model.js";
import { sendSuccessResponse } from "../utils/functions.js";

type RangeType = "today" | "week" | "month" | "custom";
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


export async function getOrderSummaryData(req:Request<{},{},{},{range:RangeType; startDateParam:string; endDateParam:string;}>, res:Response, next:NextFunction) {
    try {
        const {range, startDateParam, endDateParam} = req.query;

        const {startDate, endDate} = getDateRange(range, startDateParam, endDateParam);

        console.log(startDate, endDate);

        const result = await Order.aggregate([
            {
                $match:{
                    $or:[
                        {orderStatus:"pending", createdAt:{$gt:startDate, $lte:endDate}},
                        {
                            orderStatus:{
                                $in:["processing", "shipped", "delivered", "cancelled"]
                            },
                            updatedAt:{$gt:startDate, $lte:endDate}
                        },
                    ]
                },
                $group:{
                    _id:"$orderStatus", count:{$sum:1}
                }
            }
        ]);

        console.log(result);

        sendSuccessResponse(res, "", result, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
}