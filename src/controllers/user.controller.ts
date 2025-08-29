import express, { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export async function register(req:Request, res:Response, next:NextFunction) {
    const {name, email, password, mobile, gender} = req.body;

    if (!name || !email || !password || !mobile || !gender) return res.status(200).json({success:false, message:"All fields are required", json:{name, email, password, mobile, gender}});

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

    res.status(200).json({success:true, message:"register successfull", json:userData})
}