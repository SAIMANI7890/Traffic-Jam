import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import MenuItem from "./models/MenuItem.js";
import Category from "./models/Category.js";
import Layout from "./models/Layout.js";
import Order from "./models/Order.js";

dotenv.config();

const testMultiTenancy = async () => {
  try {
    console.log("🧪 Testing Multi-Tenancy Implementation...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Test 1: Check if all models have organizationId field
    console.log("📋 Test 1: Checking model schemas...");
    const models = [
      { name: "MenuItem", model: MenuItem },
      { name: "Category", model: Category },
      { name: "Layout", model: Layout },
      { name: "Order", model: Order },
    ];

    for (const { name, model } of models) {
      const schema = model.schema.obj;
      if (schema.organizationId) {
        console.log(`  ✅ ${name} has organizationId field`);
      } else {
        console.log(`  ❌ ${name} is missing organizationId field`);
      }
    }

    // Test 2: Check if existing data has organizationId
    console.log("\n📋 Test 2: Checking existing data...");
    
    const menuItemsWithoutOrg = await MenuItem.countDocuments({
      organizationId: { $exists: false },
    });
    console.log(`  Menu Items without organizationId: ${menuItemsWithoutOrg}`);
    
    const categoriesWithoutOrg = await Category.countDocuments({
      organizationId: { $exists: false },
    });
    console.log(`  Categories without organizationId: ${categoriesWithoutOrg}`);
    
    const layoutsWithoutOrg = await Layout.countDocuments({
      organizationId: { $exists: false },
    });
    console.log(`  Layouts without organizationId: ${layoutsWithoutOrg}`);
    
    const ordersWithoutOrg = await Order.countDocuments({
      organizationId: { $exists: false },
    });
    console.log(`  Orders without organizationId: ${ordersWithoutOrg}`);

    const totalMissing = menuItemsWithoutOrg + categoriesWithoutOrg + layoutsWithoutOrg + ordersWithoutOrg;
    
    if (totalMissing === 0) {
      console.log("\n  ✅ All existing data has organizationId");
    } else {
      console.log(`\n  ⚠️  ${totalMissing} records are missing organizationId`);
      console.log("  💡 Run: node migrateToMultiTenancy.js");
    }

    // Test 3: Check admin users
    console.log("\n📋 Test 3: Checking admin users...");
    const admins = await User.find({ role: "admin" });
    console.log(`  Found ${admins.length} admin user(s)`);
    
    for (const admin of admins) {
      console.log(`    - ${admin.username} (${admin.email})`);
      console.log(`      organizationId: ${admin.organizationId}`);
      
      // Count data for this admin
      const menuCount = await MenuItem.countDocuments({ organizationId: admin.organizationId });
      const layoutCount = await Layout.countDocuments({ organizationId: admin.organizationId });
      const orderCount = await Order.countDocuments({ organizationId: admin.organizationId });
      const staffCount = await User.countDocuments({
        role: "staff",
        organizationId: admin.organizationId,
      });
      
      console.log(`      Data: ${menuCount} menus, ${layoutCount} layouts, ${orderCount} orders, ${staffCount} staff`);
    }

    // Test 4: Check for data isolation
    console.log("\n📋 Test 4: Checking data isolation...");
    if (admins.length >= 2) {
      const admin1 = admins[0];
      const admin2 = admins[1];
      
      const admin1Items = await MenuItem.find({ organizationId: admin1.organizationId });
      const admin2Items = await MenuItem.find({ organizationId: admin2.organizationId });
      
      console.log(`  Admin 1 (${admin1.username}) has ${admin1Items.length} menu items`);
      console.log(`  Admin 2 (${admin2.username}) has ${admin2Items.length} menu items`);
      
      // Check if there's any overlap
      const admin1ItemIds = admin1Items.map(item => item._id.toString());
      const admin2ItemIds = admin2Items.map(item => item._id.toString());
      const overlap = admin1ItemIds.filter(id => admin2ItemIds.includes(id));
      
      if (overlap.length === 0) {
        console.log("  ✅ No data overlap - isolation is working!");
      } else {
        console.log(`  ❌ Found ${overlap.length} overlapping items - isolation is broken!`);
      }
    } else {
      console.log("  ⚠️  Need at least 2 admin users to test isolation");
      console.log("  💡 Create another admin account to test isolation");
    }

    // Test 5: Check indexes
    console.log("\n📋 Test 5: Checking indexes...");
    const categoryIndexes = await Category.collection.getIndexes();
    console.log("  Category indexes:");
    for (const [name, index] of Object.entries(categoryIndexes)) {
      console.log(`    - ${name}: ${JSON.stringify(index)}`);
    }
    
    const hasCompoundIndex = Object.values(categoryIndexes).some(
      index => index.some(field => field[0] === 'name') && 
               index.some(field => field[0] === 'organizationId')
    );
    
    if (hasCompoundIndex) {
      console.log("  ✅ Compound unique index (name + organizationId) exists");
    } else {
      console.log("  ⚠️  Compound unique index not found");
      console.log("  💡 Drop old index: db.categories.dropIndex('name_1')");
      console.log("  💡 Then restart server to create new index");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    
    const allGood = totalMissing === 0 && admins.length > 0;
    
    if (allGood) {
      console.log("✅ Multi-tenancy is properly configured!");
      console.log("\n📝 Next Steps:");
      console.log("  1. Create multiple admin accounts to test isolation");
      console.log("  2. Verify each admin sees only their own data");
      console.log("  3. Test staff access within organizations");
    } else {
      console.log("⚠️  Multi-tenancy needs attention!");
      console.log("\n📝 Action Items:");
      if (totalMissing > 0) {
        console.log("  1. Run migration: node migrateToMultiTenancy.js");
      }
      if (admins.length === 0) {
        console.log("  2. Create at least one admin account");
      }
      console.log("  3. Run this test again after fixes");
    }

    await mongoose.connection.close();
    console.log("\n✅ Test completed - Database connection closed");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
};

testMultiTenancy();
