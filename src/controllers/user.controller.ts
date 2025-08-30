import express, { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { ErrorHandler } from "../utils/classes.js";
import { sendSuccessResponse } from "../utils/functions.js";
import JsonWebToken from "jsonwebtoken";
import { AuthenticatedResponse } from "../middlewares/middlewares.js";


export async function register(req:Request, res:Response, next:NextFunction) {
    try {
        const {name, email, password, mobile, gender} = req.body;
    
        if (!name || !email || !password || !mobile || !gender) return next(new ErrorHandler("All fields are required", 400));
    
        const isUserExist = await User.findOne({email});
    
        if (isUserExist) return next(new ErrorHandler("user already exist i will change this message", 409));
    
        // hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT || "10", 7);
        const hashPassword = await bcrypt.hash(password, saltRounds);
    
        // create new user
        const newUser = await User.create({
            name, email, password:hashPassword, mobile, gender
        });
    
        // transform user object password free for response we also set this in userModel using toJSON method
        const {password:_, ...userData} = newUser.toObject();
    
        sendSuccessResponse(res, "registration successfull", userData, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export async function login(req:Request, res:Response, next:NextFunction){
    try {
        const {email, password} = req.body;

        if (!email || !password) return next(new ErrorHandler("All fields are required", 400));
        
        const isUserExist = await User.findOne({email}).select("+password");

        if (!isUserExist) return next(new ErrorHandler("email not found i will change this message", 404));
        
        // compare hashed password
        const isPasswordMatch = await bcrypt.compare(password, isUserExist.password as string);
        
        if (!isPasswordMatch) return next(new ErrorHandler("wrong password i will change this message", 401));
        
        // transform user object password free for response
        const {password:_, ...loginedUser } = isUserExist.toObject();
        
        const newToken = await JsonWebToken.sign({id:loginedUser._id}, process.env.JWT_SECRET as string, {expiresIn:"3d"})

        if (!newToken) return next(new ErrorHandler("newToken not found", 404));
        
        res.cookie("token", newToken, {httpOnly:false, secure:false, sameSite:"none", maxAge:1000*60*60*24*3});
        //res.cookie("token", loginedUser._id, {httpOnly:true, secure:true, sameSite:"none", maxAge:1000*60*60*24*3});

        sendSuccessResponse(res, "login successfull", loginedUser, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export async function myProfile(req:Request, res:Response, next:NextFunction){
    try {
        const userID = (req as AuthenticatedResponse).user.id;
        const me = await User.findById(userID);

        if (!me) return next(new ErrorHandler("login first", 401));

        sendSuccessResponse(res, "loggedIn user", me, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
}