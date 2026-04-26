import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("DB Connected successfully");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};