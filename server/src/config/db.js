import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
    try {
        if (!config.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in environment variables");
        }

        const connect = await mongoose.connect(config.MONGODB_URL, {
            // Connection options for better reliability
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`MongoDB Connected: ${connect.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });
        
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1); // Exit process if DB connection fails
    }   
}

