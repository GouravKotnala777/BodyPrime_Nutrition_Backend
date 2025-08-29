import { Response } from "express";


export function sendSuccessResponse(res:Response, message:string, jsonData:{}, statusCode:number) {
    res.status(statusCode).json({success:true, message, jsonData:jsonData});
}