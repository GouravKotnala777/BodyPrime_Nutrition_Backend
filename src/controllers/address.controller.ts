import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";
import Address, { AddressTypes } from "../models/address.model.js";
import { ErrorHandler } from "../utils/classes.js";
import { sendSuccessResponse } from "../utils/functions.js";

export async function getMyAddressess (req:Request<{},{},AddressTypes>, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id

        const existingAddresses = await Address.find({userID}).select("_id address1 address2 landmark city state country pincode");

        sendSuccessResponse(res, "all addresses", existingAddresses, 200);
    } catch (error) {
        console.log(error);        
        next(error);
    }    
};
export async function createAddress (req:Request<{},{},AddressTypes>, res:Response, next:NextFunction) {
    try {
        const userID = (req as AuthenticatedRequest).user.id
        const {address1, address2, landmark, city, state, country, pincode}:{address1:string; address2:string; landmark?:string; city:string; state:string; country:string; pincode:string;} = req.body;

        if (!address1 || !address2 || !city || !state || !country || !pincode) return next(new ErrorHandler("All fields are required", 400));

        const newAddress = await Address.create({
            userID,
            address1, address2, landmark, city, state, country, pincode
        });

        if (!newAddress) return next(new ErrorHandler("internal server error", 500));

        const {userID:_, ...transformedObject} = newAddress;
        //select("_id address1 address2 landmark city state country pincode");

        sendSuccessResponse(res, "new address created", transformedObject, 201);
    } catch (error) {
        console.log(error);        
        next(error);
    }    
};
export async function deleteMyAddress (req:Request<{},{},AddressTypes, {addressID:string;}>, res:Response, next:NextFunction) {
    try {
        const {addressID} = req.query;

        if (!addressID) return next(new ErrorHandler("addressID is undefined", 404));

        const aa = await Address.findByIdAndDelete(addressID);

        sendSuccessResponse(res, "addresses deleted successfully", {}, 200);
    } catch (error) {
        console.log(error);        
        next(error);
    }    
};