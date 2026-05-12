import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB connected");

    // Find an admin user
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("✗ No admin user found in database");
      process.exit(1);
    }

    console.log("✓ Admin user found:", {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
      organizationId: admin.organizationId?.toString() || null,
    });

    // Generate a token
    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: admin.role,
        organizationId: admin.organizationId?.toString() || admin._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✓ Token generated:", token.substring(0, 50) + "...");

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✓ Token decoded:", decoded);

    // Fetch user from database using decoded ID
    const fetchedUser = await User.findById(decoded.id).select("username email role organizationId");
    if (!fetchedUser) {
      console.log("✗ User not found when fetching by decoded ID");
      process.exit(1);
    }

    console.log("✓ User fetched from DB:", {
      id: fetchedUser._id.toString(),
      username: fetchedUser.username,
      email: fetchedUser.email,
      role: fetchedUser.role,
      organizationId: fetchedUser.organizationId?.toString() || null,
    });

    // Check if role is admin
    if (fetchedUser.role === "admin") {
      console.log("✓ User role is admin - authentication should work!");
    } else {
      console.log("✗ User role is NOT admin:", fetchedUser.role);
    }

    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

testAuth();
