import mongoose, { Model } from "mongoose";

interface UserTypes{
    name:string;
    email:string;
    password?:string;
    mobile:string;
    gender:"male"|"female"|"other";
    confirmPassword:string;
}

const userSchema = new mongoose.Schema<UserTypes>({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    mobile:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:["male", "female", "other"],
        required:true
    },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            return ret;
        }
    },
    timestamps:true
    }
);

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;