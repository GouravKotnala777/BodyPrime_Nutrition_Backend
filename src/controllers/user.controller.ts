import express, { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export async function register(req:Request, res:Response, next:NextFunction) {
    const {name, email, password, mobile, gender} = req.body;

    if (!name || !email || !password || !mobile || !gender) return res.status(200).json({success:false, message:"All fields are required", json:{name, email, password, mobile, gender}});

    const isUserExist = await User.findOne({email});

    if (isUserExist) return res.status(200).json({success:false, message:"user already exist", json:{email, password}});

    const hashPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT as string);

    const newUser = await User.create({
        name, email, password:hashPassword, mobile, gender
    });

    res.status(200).json({success:true, message:"register successfull", json:{...newUser}})
}