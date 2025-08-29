import mongoose from "mongoose";

async function connectDatabase(databaseURI:string|undefined):Promise<void> {
    try {
        if (!databaseURI) throw Error("databaseURI is undefined");
        await mongoose.connect(databaseURI);
        console.log("Database....");
    } catch (error) {
        console.log(error);
        console.log("db mai koi error hai");
    }
};

export default connectDatabase;