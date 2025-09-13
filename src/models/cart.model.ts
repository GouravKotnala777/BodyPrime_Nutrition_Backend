import mongoose, { Model } from "mongoose";

export interface CartTypes{
    userID:mongoose.Schema.Types.ObjectId;
    products:{
        productID:mongoose.Types.ObjectId;
        quantity:number;
    }[];
    totalPrice:number;
};

const cartSchema = new mongoose.Schema<CartTypes>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        rel:"User"
    },
    products:[{
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            rel:"Product"
        },
        quantity:Number
    }],
    totalPrice:Number
});

const cartModel:Model<CartTypes> = mongoose.models.Cart || mongoose.model<CartTypes>("Cart", cartSchema);

export default cartModel;