import mongoose, { Model } from "mongoose";
import { ProductTypes } from "./product.model.js";

export interface WishlistTypes {
  userID: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
};
export interface WishlistTypesPopulates {
  userID: mongoose.Types.ObjectId;
  products:Pick<ProductTypes, "_id"|"name"|"brand"|"category"|"price"|"weight"|"flavor"|"images"|"size">[];
};
//export interface WishlistTypesFlatted {
//  userID: mongoose.Types.ObjectId;
//  products: (Pick<ProductTypes, "_id"|"name"|"brand"|"category"|"price"|"weight"|"flavor"|"images"|"size">&{quantity: number;})[];
//};

const wishlistSchema = new mongoose.Schema<WishlistTypes>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    products:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
          }]
}, {timestamps:true});

const wishlistModel:Model<WishlistTypes> = mongoose.models.Wishlist || mongoose.model<WishlistTypes>("Wishlist", wishlistSchema);

export default wishlistModel;