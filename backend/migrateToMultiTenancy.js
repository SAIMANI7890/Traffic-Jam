import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import MenuItem from "./models/MenuItem.js";
import Category from "./models/Category.js";
import Layout from "./models/Layout.js";
import Order from "./models/Order.js";

dotenv.config();

const migrateToMultiTenancy = async () => {
  try {
    console.log("🔄 Starting multi-tenancy migration...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find the first admin user (or you can specify a particular admin)
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.log("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    console.log(`📋 Found admin: ${admin.username} (${admin.email})`);
    console.log(`🔑 Using organizationId: ${admin.organizationId}`);

    // Update all MenuItems without organizationId
    const menuItemsResult = await MenuItem.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: admin.organizationId } }
    );
    console.log(`✅ Updated ${menuItemsResult.modifiedCount} menu items`);

    // Update all Categories without organizationId
    const categoriesResult = await Category.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: admin.organizationId } }
    );
    console.log(`✅ Updated ${categoriesResult.modifiedCount} categories`);

    // Update all Layouts without organizationId
    const layoutsResult = await Layout.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: admin.organizationId } }
    );
    console.log(`✅ Updated ${layoutsResult.modifiedCount} layouts`);

    // Update all Orders without organizationId
    const ordersResult = await Order.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: admin.organizationId } }
    );
    console.log(`✅ Updated ${ordersResult.modifiedCount} orders`);

    // Update all Staff users without organizationId
    const staffResult = await User.updateMany(
      { role: "staff", organizationId: { $exists: false } },
      { $set: { organizationId: admin.organizationId } }
    );
    console.log(`✅ Updated ${staffResult.modifiedCount} staff users`);

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n⚠️  IMPORTANT NOTES:");
    console.log("1. All existing data has been assigned to the first admin user");
    console.log("2. New admin users will start with empty data");
    console.log("3. Each organization's data is now isolated");
    console.log("4. You may want to drop and recreate indexes for the Category model");
    console.log("   to ensure the compound unique index works correctly.");

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateToMultiTenancy();
