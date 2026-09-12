import mongoose, { Model } from "mongoose";
import { ProductTypes } from "./product.model.js";
import { ProductVariantInterface } from "./variant.model.js";

export interface WishlistTypes {
  userID: mongoose.Types.ObjectId;
  products: {
    //productID:mongoose.Types.ObjectId;
    productID:mongoose.Schema.Types.ObjectId;
    variant:string;
  }[];
};
export interface WishlistTypesPopulates {
  userID: mongoose.Types.ObjectId;
  products:{
    //productID: Pick<ProductTypes, "_id"|"name"|"brand"|"category"|"images">;
    productID:(Pick<ProductTypes, "_id"|"name"|"brand"|"category">&Pick<ProductVariantInterface,"price"|"weights"|"flavor"|"images">);
    variant:string;
  }[];
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
      productID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
      },
      variant:{
        type:String,
        required:true
      }
    }]
}, {timestamps:true});

const wishlistModel:Model<WishlistTypes> = mongoose.models.Wishlist || mongoose.model<WishlistTypes>("Wishlist", wishlistSchema);

export default wishlistModel;