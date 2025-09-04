import mongoose, { Model } from "mongoose";

export interface ProductTypes {
    name:string;
    price:number;
    brand:string;
    category:"protein"|"pre-workout"|"vitamins"|"creatine"|"other";
    size:number;
    tag:string[];
    description: string;
    images: string[];
    stock: number;
    weight?: string;
    ingredients?: string[];
    nutritionFacts?: {
        servingSize: string;
        servingsPerContainer: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        calories?: number;
    };
    rating: number;
    numReviews: number;
    flavor?:string;
    warning?:string[];
};

const productSchema = new mongoose.Schema<ProductTypes>({
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["protein", "pre-workout", "vitamins", "creatine", "other"],
    },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    weight: { type: String },
    flavor: { type: String },
    ingredients: [{ type: String }],
    nutritionFacts: {
      servingSize: { type: String },
      servingsPerContainer: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
      calories: { type: Number },
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    size:{
        type:Number,
        required:true
    },
    tag:[{
        type:String
    }]

}, {
    timestamps:true
});

const productModel:Model<ProductTypes> = await mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;