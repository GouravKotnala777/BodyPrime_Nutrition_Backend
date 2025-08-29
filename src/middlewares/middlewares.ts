import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/classes.js";


export async function errorMiddleware(err:ErrorHandler, req:Request, res:Response, next:NextFunction) {
    let message = err.message || "Internal Server Error";
    let statusCode = err.statusCode || 500;
    if (err.name === "CastError") {
        message = "Wrong ObjectId Format";
        statusCode = 400;
    }
    if (err.name === "ValidationError") {
        statusCode = 400;
    }
    
    res.status(statusCode).json({success:false, message:message, json:{}});
}