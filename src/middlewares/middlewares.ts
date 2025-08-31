import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/classes.js";
import { sendSuccessResponse } from "../utils/functions.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import JsonWebToken, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedResponse extends Request {
    user:JwtPayload&{id:string};
};

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
};

export async function isUserAuthenticated(req:Request, res:Response, next:NextFunction){
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        const token:string|null = req.cookies?.token || req.headers.authorization?.split(" ")[1] || null;

        if (!token) return next(new ErrorHandler("token not found", 404));

        if (!JWT_SECRET) return next(new ErrorHandler("JWT_SECRET not found", 404));

        const user = await JsonWebToken.verify(token, JWT_SECRET as string) as ({id:string} & JwtPayload);        

        (req as AuthenticatedResponse).user = user;
        
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}