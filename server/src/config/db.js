import mongoose from "mongoose"


export const connectDB = async ()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/ai_mock_test");
        console.log("MongoDB is Connected !");
        
    } catch (error) {
        console.error("MongoDB connection failed:" , error)
    }   
}