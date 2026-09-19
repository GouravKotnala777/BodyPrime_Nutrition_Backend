import mongoose, { Model } from "mongoose";

export interface AddressTypes{
    userID:mongoose.Schema.Types.ObjectId;
    address1:string;
    address2:string;
    landmark:string;
    city:string;
    state:string;
    country:string;
    pincode:string;
};

const addressSchema = new mongoose.Schema<AddressTypes>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    address1:String,
    address2:String,
    landmark:String,
    city:String,
    state:String,
    country:String,
    pincode:String
});

const addressModel:Model<AddressTypes> = mongoose.models.Address || mongoose.model<AddressTypes>("Address", addressSchema);

export default addressModel;