import mongoose, { Model } from "mongoose";


export interface ReviewTypes{
    _id:mongoose.Schema.Types.ObjectId;
    productID:mongoose.Schema.Types.ObjectId;
    userID:mongoose.Schema.Types.ObjectId;
    rating:number;
    comment:string;
    createdAt:string;
    updatedAt:string;
};

const reviewSchema = new mongoose.Schema<ReviewTypes>({
    productID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    rating:{
        type:Number,
        required:true,
        default:0
    },
    comment:{
        type:String,
        maxLength:100
    }
}, {timestamps:true});

const reviewModel:Model<ReviewTypes> = mongoose.models.Review || mongoose.model<ReviewTypes>("Review", reviewSchema);

export default reviewModel;