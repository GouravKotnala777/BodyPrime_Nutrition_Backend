import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { ErrorHandler } from "../utils/classes.js";
import { generateJWTToken, hashPassword, sendEmail, sendSuccessResponse, verifyJWTToken } from "../utils/functions.js";
import JsonWebToken from "jsonwebtoken";
import { AuthenticatedRequest } from "../middlewares/middlewares.js";


export async function register(req:Request, res:Response, next:NextFunction) {
    try {
        const {name, email, password, mobile, gender} = req.body;
        const JWT_SECRET = process.env.JWT_SECRET;
    
        if (!name || !email || !password || !mobile || !gender) return next(new ErrorHandler("All fields are required", 400));
    
        const isUserExist = await User.findOne({email});    

        if (isUserExist) return next(new ErrorHandler("user already exist i will change this message", 409));
        
        // hash password
        const hashedPassword = await hashPassword(password);
        
        // generate emailVerificationToken for email verification
        const emailVerificationToken = await generateJWTToken({payload:{email}, secret:JWT_SECRET, options:{expiresIn:"1h"}});


        // create new user
        const newUser = await User.create({
            name, email, password:hashedPassword, mobile, gender,
            emailVerificationToken,
            emailVerificationTokenExpire:Date.now()+90000
        });

        const sendEmailRes = await sendEmail({
            to:email,
            subject:"email verification",
            text:"patoni kya chal ro hai",
            html:`
                <html>
                    <head>
                        <title></title>
                    </head>
                    <body>
                        <h1>Click on this link</h1>
                        <p>http://localhost:8000/user/email_verification?email_verification_token=${emailVerificationToken}</p>
                    </body>
                </html>
            `
        });

        // transform user object password free for response we also set this in userModel using toJSON method
        const {password:_, ...userData} = newUser.toObject();
    
        sendSuccessResponse(res, "Verification link has sent to your email", userData, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function login(req:Request, res:Response, next:NextFunction){
    try {
        const {email, password} = req.body;
        const JWT_SECRET = process.env.JWT_SECRET;
        const NODE_ENV = process.env.NODE_ENV;

        if (!email || !password) return next(new ErrorHandler("All fields are required", 400));
        
        const isUserExist = await User.findOne({email}).select("+password");

        if (!isUserExist) return next(new ErrorHandler("email not found i will change this message", 404));
        
        // compare hashed password
        const isPasswordMatch = await bcrypt.compare(password, isUserExist.password as string);
        
        if (!isPasswordMatch) return next(new ErrorHandler("wrong password i will change this message", 401));
        
        // transform user object password free for response
        const {password:_, ...loginedUser } = isUserExist.toObject();

        if (isUserExist.isVerified) {
            const newToken = await generateJWTToken({payload:{id:loginedUser._id}, secret:JWT_SECRET, options:{expiresIn:"3d"}});
            
            res.cookie("token", newToken, {httpOnly:NODE_ENV === "producton", secure:NODE_ENV === "producton", sameSite:"none", maxAge:1000*60*60*24*3});
    
            sendSuccessResponse(res, "login successfull", loginedUser, 200);
        }
        else{
            // generate emailVerificationToken for email verification
            if (!JWT_SECRET) return next(new ErrorHandler("JWT_SECRET not found", 404));
            const emailVerificationToken = await generateJWTToken({payload:{email}, secret:JWT_SECRET, options:{expiresIn:"1h"}});

            isUserExist.emailVerificationToken = emailVerificationToken;
            isUserExist.emailVerificationTokenExpire = Date.now() + 90000;
            await isUserExist.save();

            //====================
            const sendEmailRes = await sendEmail({
                to:email,
                subject:"email verification",
                text:"patoni kya chal ro hai",
                html:`
                    <html>
                        <head>
                            <title></title>
                        </head>
                        <body>
                            <h1>Click on this link</h1>
                            <p>http://localhost:8000/user/email_verification?email_verification_token=${emailVerificationToken}</p>
                        </body>
                    </html>
                `
            });

            if (sendEmailRes.rejected) return next(new ErrorHandler(sendEmailRes.rejected[0] as string, 403));
        
            sendSuccessResponse(res, "Verification link has sent to your email", sendEmailRes, 200);
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function myProfile(req:Request, res:Response, next:NextFunction){
    try {
        const userID = (req as AuthenticatedRequest).user.id;
        const me = await User.findById(userID);

        if (!me) return next(new ErrorHandler("login first", 401));

        sendSuccessResponse(res, "loggedIn user", me, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function updateMyProfile(req:Request, res:Response, next:NextFunction){
    try {
        const {name, mobile, gender} = req.body;

        if (!name && !mobile && !gender) return next(new ErrorHandler("All fields are empty", 400));
        const userID = (req as AuthenticatedRequest).user.id;
        const updatedProfile = await User.findByIdAndUpdate(userID, {
            ...(name&&{name}),
            ...(mobile&&{mobile}),
            ...(gender&&{gender})
        }, {new:true});

        if (!updatedProfile) return next(new ErrorHandler("Internal server error", 500));

        sendSuccessResponse(res, "Profile updated", updatedProfile, 200);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function forgetPassword(req:Request, res:Response, next:NextFunction){
    try {
        const {email} = req.body;
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!email) return next(new ErrorHandler("Email is required", 400));
        
        // find if any user already exists with this email
        const isUserWithThisEmailExist = await User.findOne({email});
        
        if (!isUserWithThisEmailExist) return next(new ErrorHandler("Email not exists", 404));
        if (!JWT_SECRET) return next(new ErrorHandler("JWT_SECRET not found", 404));
        
        const resetPasswordToken = await generateJWTToken({payload:{id:isUserWithThisEmailExist._id}, secret:JWT_SECRET, options:{expiresIn:"1h"}});
        if (!resetPasswordToken) return next(new ErrorHandler("resetPasswordToken not found", 404));

        // Send token along with link email 
        const sendEmailRes = await sendEmail({
            to:email,
            subject:"texting ho rahi hai",
            text:"badmoshi chal rahi hai",
            html:`
            <html>
                <head>
                    <title></title>
                </head>
                <body>
                    <h1>Click on this link</h1>
                    <p>http://localhost:8000/user/reset_password?reset_password_token=${resetPasswordToken}</p>
                </body>
            </html>
            `
        });

        console.log({sendEmailRes});
        
        sendSuccessResponse(res, "Email has been sent", {sendEmailRes}, 201);
    } catch (error) {
        console.log(error);
        next(error);        
    }
}

export async function resetPassword(req:Request, res:Response, next:NextFunction){
    try {
        const {password} = req.body;
        const {reset_password_token:resetPasswordToken} = req.query;
        const JWT_SECRET = process.env.JWT_SECRET;
        const NODE_ENV = process.env.NODE_ENV;

        if (!password) return next(new ErrorHandler("Password is required", 400));
        if (!resetPasswordToken) return next(new ErrorHandler("reset_password_token is not found", 404));
        if (!JWT_SECRET) return next(new ErrorHandler("JWT_SECRET is not found", 404));


        // verify token for reset password
        const verifyResetPasswordToken = await verifyJWTToken({token:resetPasswordToken as string, secret:JWT_SECRET}) as {id:string};

        // hash password
        const hashedPassword = await hashPassword(password);

        const findUserByIdAndUpdate = await User.findByIdAndUpdate(verifyResetPasswordToken.id, {
            password:hashedPassword
        });

        if (!findUserByIdAndUpdate) return next(new ErrorHandler("Internal Server Error", 500));

        const newToken = await generateJWTToken({payload:{id:findUserByIdAndUpdate._id}, secret:JWT_SECRET, options:{expiresIn:"3d"}});

        if (!newToken) return next(new ErrorHandler("newToken not found", 404));
        
        res.cookie("token", newToken, {httpOnly:NODE_ENV === "producton", secure:NODE_ENV === "producton", sameSite:"none", maxAge:1000*60*60*24*3});
        
        sendSuccessResponse(res, "Password updated successfully", {findUserByIdAndUpdate}, 201);
    } catch (error) {
        console.log(error);
        next(error);        
    }
};

export async function verifyEmail(req:Request, res:Response, next:NextFunction){
    try {
        const {email_verification_token:emailVerificationToken} = req.query;
        const JWT_SECRET = process.env.JWT_SECRET;
        const NODE_ENV = process.env.NODE_ENV;

        if (!emailVerificationToken) return next(new ErrorHandler("emailVerificationToken not found", 404));
        if (!JWT_SECRET) return next(new ErrorHandler("JWT_SECRET not found", 404));
        
        
        const verifyEmailVerificationToken = await verifyJWTToken({token:emailVerificationToken as string, secret:JWT_SECRET}) as {email:string};

        const findUser = await User.findOne({
            email:verifyEmailVerificationToken.email,
            emailVerificationToken,
            emailVerificationTokenExpire:{
                $gt:Date.now()
            }
        });
        
        if (!findUser) return next(new ErrorHandler("user not found", 404));

        findUser.isVerified = true;
        findUser.emailVerificationToken = null;
        findUser.emailVerificationTokenExpire = null;

        await findUser.save();

        
        // transform user object password free for response
        const {password:_, ...loginedUser } = findUser.toObject();
        
        const newToken = await generateJWTToken({payload:{id:loginedUser._id}, secret:JWT_SECRET, options:{expiresIn:"3d"}});

        if (!newToken) return next(new ErrorHandler("newToken not found", 404));

        res.cookie("token", newToken, {httpOnly:NODE_ENV === "producton", secure:NODE_ENV === "producton", sameSite:"none", maxAge:1000*60*60*24*3});

        sendSuccessResponse(res,"Email verification successfull", {loginedUser}, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function logout(req:Request, res:Response, next:NextFunction){
    try {
        const token = req.cookies.token;
        const NODE_ENV = process.env.NODE_ENV;
        
        if (!token) return next(new ErrorHandler("token not found", 404));

        res.clearCookie("token", {httpOnly:NODE_ENV === "producton", secure:NODE_ENV === "producton", sameSite:"strict"});

        sendSuccessResponse(res, "User Logout", {token}, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export async function getAllUsers(req:Request, res:Response, next:NextFunction){
    try {
        const allUsers = await User.find();

        const resMessage = allUsers.length === 0 ? "No user yet" : "All users";

        sendSuccessResponse(res, resMessage , {...allUsers}, 201);
    } catch (error) {
        console.log(error);
        next(error);
    }
};