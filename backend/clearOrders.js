import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";

dotenv.config();

const clearOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete all orders
    const result = await Order.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} orders`);

    console.log("✅ All orders cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing orders:", error);
    process.exit(1);
  }
};

clearOrders();
