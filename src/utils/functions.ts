import { Request, Response } from "express";
import { ErrorHandler } from "./classes.js";
import nodemailer from "nodemailer";

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
        const transporter = nodemailer.createTransport({
            host:process.env.TRANSPORTER_HOST,
            port:Number(process.env.TRANSPORTER_PORT),
            secure:false,
            auth:{
                user:process.env.TRANSPORTER_ID,
                pass:process.env.TRANSPORTER_PASS,
            },
        });

        // Email Options
        const mailOptions = {
            from:`"BodyPrime Nutrition" <${process.env.TRANSPORTER_ID}>`,
            to,
            subject,
            text,
            html
        };

        //Send Mail
        const sendEmailRes = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully");

        return sendEmailRes;
        
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