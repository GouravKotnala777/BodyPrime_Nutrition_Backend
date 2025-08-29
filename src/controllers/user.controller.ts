import express, { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export async function register(req:Request, res:Response, next:NextFunction) {
    try {
        const {name, email, password, mobile, gender} = req.body;
    
        if (!name || !email || !password || !mobile || !gender) return res.status(400).json({success:false, message:"All fields are required", json:{name, email, password, mobile, gender}});
    
        const isUserExist = await User.findOne({email});
    
        if (isUserExist) return res.status(409).json({success:false, message:"user already exist i will change this message", json:{}});
    
        // hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT || "10", 7);
        const hashPassword = await bcrypt.hash(password, saltRounds);
    
        // create new user
        const newUser = await User.create({
            name, email, password:hashPassword, mobile, gender
        });
    
        // transform user object password free for response we also set this in userModel using toJSON method
        const {password:_, ...userData} = newUser.toObject();
    
        res.status(201).json({success:true, message:"register successfull", json:userData})
    } catch (error) {
        console.log(error);
    }
}

export async function login(req:Request, res:Response, next:NextFunction){
    try {
        const {email, password} = req.body;

        if (!email || !password) return res.status(400).json({success:false, message:"All fields are required", json:{email, password}});
        
        const isUserExist = await User.findOne({email}).select("+password");
        console.log(isUserExist);

        if (!isUserExist) return res.status(404).json({success:false, message:"email not found i will change this message", json:{}});
        
        const isPasswordMatch = await bcrypt.compare(password, isUserExist.password as string);
        
        if (!isPasswordMatch) return res.status(401).json({success:false, message:"wrong password i will change this message", json:{}});
        console.log(isPasswordMatch);
        
        
        const {password:_, ...loginedUser } = isUserExist.toObject();

        console.log(loginedUser);
        
        res.status(200).json({success:true, message:"login successfull", json:loginedUser})
    } catch (error) {
        console.log(error);
    }
}