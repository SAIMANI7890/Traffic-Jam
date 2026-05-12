import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    console.log("Testing MongoDB connection...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Not set");
    
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log("✅ Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
};

testConnection();
