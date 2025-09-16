import mongoose, { Model } from "mongoose";
import { ProductTypes } from "./product.model.js";

export interface CartTypes {
  userID: mongoose.Types.ObjectId;
  products: {
    productID: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  totalPrice: number;
};
export interface CartTypesPopulates {
  userID: mongoose.Types.ObjectId;
  products: {
    productID: Pick<ProductTypes, "_id"|"name"|"brand"|"category"|"price"|"weight"|"flavor"|"images"|"size">;
    quantity: number;
  }[];
  totalPrice: number;
};
export interface CartTypesFlatted {
  userID: mongoose.Types.ObjectId;
  products: (Pick<ProductTypes, "_id"|"name"|"brand"|"category"|"price"|"weight"|"flavor"|"images"|"size">&{quantity: number;})[];
  totalPrice: number;
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