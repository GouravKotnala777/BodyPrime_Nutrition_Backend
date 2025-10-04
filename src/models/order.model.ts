import mongoose, { Model } from "mongoose";
import { ProductTypes } from "./product.model.js";

export type PaymentStatusType = "canceled"|"processing"|"requires_action"|"requires_capture"|"requires_confirmation"|"requires_payment_method"|"succeeded"|"refunded";
export interface OrderTypes {
    userID: mongoose.Types.ObjectId;
    products: {
        productID: mongoose.Types.ObjectId;
        name:string;
        price:number;
        quantity: number;
    }[];
    shippingInfo: {
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        phone: string;
    };
    paymentInfo: {
        method: "COD" | "Stripe";
        transactionID?: string;
        status:PaymentStatusType;
        message?:string;
        error?:string;
    };
    priceSummary: {
        itemsPrice: number;
        taxPrice: number;
        shippingPrice: number;
        discount: number;
        totalPrice: number;
    };
    orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};
export interface OrderTypesPopulates {
    userID: mongoose.Types.ObjectId;
    products: {
        productID: Pick<ProductTypes, "_id"|"name"|"brand"|"category"|"price"|"weight"|"flavor"|"images"|"size">;
        name:string;
        price:number;
        quantity: number;
    }[];
    shippingInfo: {
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        phone: string;
    };
    paymentInfo: {
        method: "COD" | "Stripe";
        transactionID?: string;
        status:PaymentStatusType;
        message?:string;
        error?:string;
    };
    priceSummary: {
        itemsPrice: number;
        taxPrice: number;
        shippingPrice: number;
        discount: number;
        totalPrice: number;
    };
    orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};
//export interface OrderTypesFlatted {
//  userID: mongoose.Types.ObjectId;
//  products: (Pick<ProductTypes, "_id"|"name"|"brand"|"category"|"price"|"weight"|"flavor"|"images"|"size">&{quantity: number;})[];
//  totalPrice: number;
//};

const orderSchema = new mongoose.Schema<OrderTypes>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    products:[{
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        name:String,
        price:Number,
        quantity:Number
    }],
    shippingInfo:{
        address: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        phone: String
    },
    paymentInfo:{
        method:{
            type:String,
            enum:["COD", "Stripe"]
        },
        transactionID:String,
        status:{
            type:String,
            enum:["canceled", "processing", "requires_action", "requires_capture", "requires_confirmation", "requires_payment_method", "succeeded", "refunded", "refunded"],
            default:"processing"
        },
        message:String,
        error:String,
    },
    priceSummary:{
        itemsPrice:Number,
        taxPrice:Number,
        shippingPrice:Number,
        discount:Number,
        totalPrice:Number
    },
    orderStatus:{
        type:String,
        enum:["pending", "processing", "shipped", "delivered", "cancelled"]
    },
    deliveredAt:Date
}, {timestamps:true});

const orderModel:Model<OrderTypes> = mongoose.models.Order || mongoose.model<OrderTypes>("Order", orderSchema);

export default orderModel;