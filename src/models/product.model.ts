import mongoose, { Model } from "mongoose";

export interface ProductTypes {
    _id:mongoose.Schema.Types.ObjectId;
    name:string;
    brand:string;
    category:"protein"|"pre-workout"|"vitamins"|"creatine"|"other";
    description?: string;
    ingredients?: string[];
    nutritionFacts?: {
        servingSize: string;
        servingsPerContainer: number;
        protein: number;
        carbs: number;
        fat: number;
        calories: number;
    };
    rating: number;
    avgRating:number;
    numReviews: number;
    returnCount:number;
    images?: string[];

    variants:string[];
    //variants:mongoose.Schema.Types.ObjectId[];

    //size:number; // remove this field
    
    price:number;
    //description?: string; // product & variant both have description field
    stock?: number;
    weight?: string;
    flavor?:string;
    dietaryType:"veg"|"nonveg"|"vegan";
    warnings?:string[];
    soldCount:number;
    //images?: string[]; // product & variant both have images field
    tags:string[];
};

const productSchema = new mongoose.Schema<ProductTypes>({
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["protein", "pre-workout", "vitamins", "creatine", "other"],
    },
    description: { type: String },
    images: [{ type: String }],
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
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    returnCount:{
        type:Number,
        default:0
    },
    variants:[{
        type:String
    }],


    //size:{ // removed this field
    //    type:Number,
    //    required:true
    //},


    price: { type: Number, required: true },
    weight:{ type: String, required:true },
    stock: { type: Number, default: 0 },
    flavor: { type: String, default:"unflavored" },
    dietaryType:{type:String, enum:["veg", "nonveg", "vegan"], default:"veg"},
    warnings:[{
        type:String
    }],
    soldCount:{
        type:Number,
        default:0
    },
    tags:[{
        type:String
    }]

}, {
    timestamps:true
});

const productModel:Model<ProductTypes> = await mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;