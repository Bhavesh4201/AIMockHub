import mongoose from "mongoose"


export const connectDB = async ()=>{
    try {
        const connect = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log(`MongoDB is Connected !! ${connect}`);
        
    } catch (error) {
        console.error("MongoDB connection failed:" , error);
        throw error
    }   
}