import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

export const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(MONGO_URI, {
            // Connection timeout for initial connection
            connectTimeoutMS: 10000,
            
            // Timeout for server selection (finding a healthy server)
            serverSelectionTimeoutMS: 5000,
            
            // CRITICAL: Socket timeout prevents hung queries
            // If a socket doesn't respond within 30s, it's killed
            socketTimeoutMS: 30000,
            
            // Connection pool settings for Railway/containerized environments
            maxPoolSize: 10,        // Lower pool for serverless/container
            minPoolSize: 2,         // Pre-warm a couple connections
            maxIdleTimeMS: 60000,   // Release idle connections after 60s
            
            // Retry connection attempts
            retryWrites: true,
            retryReads: true,
            w: 1  // Acknowledge writes after primary write
        });
        console.log("✓ MongoDB Connected successfully");
        console.log(`✓ Pool size: 10 max, 2 min | Socket timeout: 30s`);
    } catch (error) {
        console.error("✗ Database connection error:", error.message);
        console.log("MONGO_URI:", MONGO_URI);
        process.exit(1);
    }
};