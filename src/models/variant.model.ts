import mongoose, { Model } from "mongoose";

export interface ProductVariantInterface{
    _id:mongoose.Schema.Types.ObjectId;
    price:number;
    description:string;
    flavor:string;
    weights:string[];
    warnings:string[];
    stock:number;
    soldCount:number;
    images?: string[];
    dietaryType:"veg"|"nonveg"|"vegan";
    tags:string[];
}

const variantSchema = new mongoose.Schema<ProductVariantInterface>({
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true,
        trim:true,
        maxLength:[200, "description cannot exceed 200 characters"]
    },
    flavor:{
        type:String,
        default:"unflavored"
    },
    warnings:{
        type:[String],
        default:[]
    },
    weights:{
        type:[String],
        required:true
    },
    stock:{
        type:Number,
        required:true,
        default:0
    },
    soldCount:{
        type:Number,
        default:0
    },
    images:{
        type:String,
        default:""
    },
    dietaryType:{
        type:String,
        enum:["veg","nonveg","vegan"],
        required:true
    },
    tags:[{
        type:String,
        default:[]
    }]
});

const variantModel:Model<ProductVariantInterface> = mongoose.models.Variant || mongoose.model<ProductVariantInterface>("Variant", variantSchema);

export default variantModel;