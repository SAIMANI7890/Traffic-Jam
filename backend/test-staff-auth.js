import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

async function testStaffAuth() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB connected");

    // Find a staff user
    const staff = await User.findOne({ role: "staff" });
    if (!staff) {
      console.log("✗ No staff user found in database");
      console.log("  This is expected if no staff users have been created yet");
      process.exit(0);
    }

    console.log("✓ Staff user found:", {
      id: staff._id.toString(),
      username: staff.username,
      email: staff.email || "N/A",
      role: staff.role,
      organizationId: staff.organizationId?.toString() || "N/A",
    });

    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

testStaffAuth();
