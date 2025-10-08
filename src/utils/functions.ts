import { Response } from "express";
import { ErrorHandler } from "./classes.js";
import bcrypt from "bcryptjs";
import jsonWebToken, { JwtPayload, SignOptions } from "jsonwebtoken";

interface SendEmailOptionsTypes{
    to:string;
    subject:string;
    text?:string;
    html:string;
}

export function sendSuccessResponse(res:Response, message:string, jsonData:{}, statusCode:number) {
    res.status(statusCode).json({success:true, message, jsonData:jsonData});
};

export async function sendEmail({to, subject, text, html}:SendEmailOptionsTypes){
    try {
        if (!process.env.BREVO_KEY) throw new ErrorHandler("BREVO_KEY not found", 404);
        if (!process.env.BREVO_URL) throw new ErrorHandler("BREVO_URL not found", 404);
        if (!process.env.BREVO_USER_NAME) throw new ErrorHandler("BREVO_USER_NAME not found", 404);
        if (!process.env.BREVO_EMAIL_ID) throw new ErrorHandler("BREVO_EMAIL_ID not found", 404);

        const res = await fetch(process.env.BREVO_URL, {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "api-key":process.env.BREVO_KEY
            },
            body:JSON.stringify({
                sender:{
                    "name":process.env.BREVO_USER_NAME,
                    "email":process.env.BREVO_EMAIL_ID
                },
                to:[{
                    "email":to
                }],
                subject,
                textContent:text,
                htmlContent:html
            })
        });
        const data = await res.json();
        console.log({data});

        if (res.ok && data.messageId) {
            console.log("Email sent successfully:", data.messageId);
        }
        else{
            console.error("Failed to send email:", data);
        }

        return data.messageId?true:false;
    } catch (error) {
        console.log("mail bhejne par error aa gayi", error);
        throw new ErrorHandler("this error is from function.ts > sendEmail", 500);
    }
};

export async function generateRandomCode(length:number=6){
    try {
        const elements = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
        let code = "";
        
        for (let i = 0; i < length; i++) {
            const position = Math.floor(Math.random()*(elements.length));
            code = code+(elements[position]);
        }
        console.log({code});
        
        return code;
    } catch (error) {
        console.log(error);
        throw new ErrorHandler((error as {message:string}).message || "Unable to generate code", 500);
    }
};

export async function hashPassword(password:string) {
    try {
        const BCRYPT_SALT = process.env.BCRYPT_SALT;
    
        if(!BCRYPT_SALT) throw new ErrorHandler("BCRYPT_SALT not found", 404);
    
        const saltRounds = parseInt(BCRYPT_SALT, 7);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log(error);
        throw error;        
    }
};

export async function generateJWTToken({payload, secret, options}:{payload:JwtPayload, secret?:string, options:SignOptions}) {
    try {
        if (!secret) throw new ErrorHandler("JWT_SECRET not found", 404);
        const token = await jsonWebToken.sign(payload, secret, options);
        if (!token) throw new ErrorHandler("token not created", 500);
        return token;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export async function verifyJWTToken({token, secret}:{token:string, secret?:string}) {
    try {
        if (!secret) throw new ErrorHandler("JWT_SECRET not found", 404);
        const payload = await jsonWebToken.verify(token, secret);
        if (!payload) throw new ErrorHandler("payload not generated", 500);
        return payload;
    } catch (error) {
        console.log(error);
        throw error;
    }
};