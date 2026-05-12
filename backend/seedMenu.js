import dotenv from "dotenv";
import mongoose from "mongoose";
import MenuItem from "./models/MenuItem.js";
import Category from "./models/Category.js";

dotenv.config();

const menuData = {
  "SOUPS": [
    { name: "Veg Sweet Corn Soup", price: 80.00 },
    { name: "Veg Hot & Sour Soup", price: 80.00 },
    { name: "Veg Manchow Soup", price: 100.00 },
    { name: "Chicken Sweet Corn Soup", price: 100.00 },
    { name: "Chicken Hot & Sour Soup", price: 100.00 },
    { name: "Chicken Manchow Soup", price: 110.00 },
  ],
  "VEG STARTERS": [
    { name: "Veg Manchurian", price: 180.00 },
    { name: "Paneer 65", price: 250.00 },
    { name: "Chilli Paneer", price: 250.00 },
    { name: "Chilli Mushroom", price: 230.00 },
    { name: "Mushroom 65", price: 230.00 },
    { name: "Crispy Corn", price: 200.00 },
  ],
  "VEG BIRIYANI": [
    { name: "Veg Biryani", price: 180.00 },
    { name: "Paneer Biryani", price: 250.00 },
    { name: "Mushroom Biryani", price: 230.00 },
    { name: "Spl. Veg Biryani", price: 300.00 },
  ],
  "VEG FRIED RICE": [
    { name: "Veg Fried Rice", price: 160.00 },
    { name: "Jeera Fried Rice", price: 160.00 },
    { name: "Paneer Fried Rice", price: 220.00 },
    { name: "Mushroom Fried Rice", price: 210.00 },
    { name: "Lemon Fried Rice", price: 160.00 },
    { name: "Tomato Rice", price: 50.00 },
    { name: "Veg Szechwan Fried Rice", price: 180.00 },
  ],
  "BREADS": [
    { name: "Pulka", price: 15.00 },
    { name: "Butter Naan", price: 70.00 },
    { name: "Plain Naan", price: 70.00 },
    { name: "Garlic Naan", price: 80.00 },
  ],
  "MEALS": [
    { name: "Plain Rice", price: 40.00 },
    { name: "Veg Thali", price: 110.00 },
    { name: "Curd Rice", price: 80.00 },
    { name: "Sambaram Rice", price: 90.00 },
    { name: "Curd", price: 10.00 },
  ],
  "VEG CURRIES": [
    { name: "Veg Chitinadu", price: 180.00 },
    { name: "Veg Kholopuri", price: 180.00 },
    { name: "Tomato Curry", price: 120.00 },
    { name: "Green Peas Masala", price: 120.00 },
    { name: "Cashew Tomato", price: 200.00 },
    { name: "Paneer Butter Masala", price: 200.00 },
    { name: "Paneer Methichem", price: 230.00 },
    { name: "Paneer Cashew Nut", price: 250.00 },
    { name: "Kadai Paneer", price: 220.00 },
    { name: "Mixed Vegetable", price: 160.00 },
    { name: "Tomato Capsicum", price: 150.00 },
    { name: "Kadai Vegetable", price: 180.00 },
    { name: "Veg Jaipuri", price: 180.00 },
    { name: "Mutter Paneer", price: 200.00 },
    { name: "Mushroom Curry", price: 180.00 },
    { name: "Mushroom Cashew Nut", price: 230.00 },
    { name: "Cashew Green Peas Masala", price: 180.00 },
  ],
  "EGG ITEMS": [
    { name: "Egg Bhurji", price: 130.00 },
    { name: "Egg Curry (2)", price: 60.00 },
    { name: "Egg Fry (3)", price: 120.00 },
    { name: "Egg Masala (3)", price: 120.00 },
    { name: "Egg Chilly", price: 160.00 },
    { name: "Egg 65", price: 160.00 },
    { name: "Boiled Egg (3)", price: 40.00 },
  ],
  "PARCEL / MEALS": [
    { name: "Veg Thali Parcel", price: 130.00 },
    { name: "Egg Meals", price: 150.00 },
    { name: "Chicken Meals B/L", price: 320.00 },
    { name: "Spl Chicken Meals B/L", price: 350.00 },
    { name: "Chicken Lollipop Masala Meals", price: 360.00 },
    { name: "White Rice Full", price: 80.00 },
  ],
  "DRINKS": [
    { name: "Water Bottle", price: 20.00 },
    { name: "Soft Drinks", price: 25.00 },
    { name: "Badam Milk (SP)", price: 50.00 },
    { name: "Badam Milk Fruit Net", price: 60.00 },
    { name: "Grape Juice", price: 30.00 },
  ],
  "NON-VEG STARTERS": [
    { name: "Chicken 65", price: 260.00 },
    { name: "Chilli Chicken", price: 250.00 },
    { name: "Chicken Manchurian", price: 260.00 },
    { name: "Chicken 85", price: 320.00 },
    { name: "Chicken Lollipop (5)", price: 240.00 },
    { name: "Chilli Lollipop (5)", price: 270.00 },
    { name: "R.R. Chicken (2)", price: 60.00 },
    { name: "Cashew R.R. Chicken", price: 310.00 },
    { name: "Chicken Pakoda (B/L)", price: 270.00 },
    { name: "Chicken Majestic", price: 320.00 },
    { name: "Chicken 555", price: 320.00 },
    { name: "Chicken Wings", price: 250.00 },
    { name: "Pepper Chicken", price: 320.00 },
    { name: "Cashew Nut Chicken", price: 320.00 },
  ],
  "TANDOORI DRY": [
    { name: "Tandoori Chicken (Full)", price: 520.00 },
    { name: "Tandoori Chicken (Half)", price: 260.00 },
    { name: "Kamili Kabab", price: 380.00 },
    { name: "Kamili Kabab (Half)", price: 200.00 },
    { name: "Egg Tandoori (5)", price: 160.00 },
  ],
  "NON-VEG BIRIYANI": [
    { name: "Biryani Rice", price: 160.00 },
    { name: "Egg Biryani", price: 190.00 },
    { name: "Chicken Dum Biryani", price: 220.00 },
    { name: "Chicken Fry Biryani", price: 240.00 },
    { name: "Spl. Chicken Biryani", price: 290.00 },
    { name: "Prawn Biryani", price: 300.00 },
    { name: "Spl. Prawn Biryani", price: 330.00 },
    { name: "Chicken Joint Biryani", price: 280.00 },
    { name: "Lollipop Biryani", price: 270.00 },
    { name: "Chicken Mogalai Biryani", price: 300.00 },
    { name: "Kabab Biryani", price: 300.00 },
    { name: "Chicken B/L Fry Biryani", price: 300.00 },
    { name: "Mutton Biryani", price: 400.00 },
  ],
  "NON-VEG FRIED RICE": [
    { name: "Egg Fried Rice", price: 190.00 },
    { name: "Chicken Fried Rice", price: 230.00 },
    { name: "Spl. Chicken Fried Rice", price: 290.00 },
    { name: "Mixed Fried Rice", price: 350.00 },
    { name: "Prawn Fried Rice", price: 260.00 },
    { name: "Spl. Prawn Fried Rice", price: 320.00 },
  ],
  "NON-VEG CURRIES": [
    { name: "Chicken Fry", price: 220.00 },
    { name: "Chicken Curry", price: 220.00 },
    { name: "Chicken Joint Fry/Curry", price: 160.00 },
    { name: "Chicken B/L Curry", price: 220.00 },
    { name: "Chicken B/L Fry", price: 260.00 },
    { name: "Butter Chicken (W/B, B/L)", price: 250.00 },
    { name: "Ginger Chicken B/L", price: 260.00 },
    { name: "Chicken Moghalai (B/L, W/B)", price: 260.00 },
    { name: "Chicken Punjabi (B/L, W/B)", price: 260.00 },
    { name: "Chicken Afghani", price: 280.00 },
    { name: "Chicken Dilkush B/L", price: 280.00 },
    { name: "Chicken Lalvani", price: 260.00 },
    { name: "Cashew Nut Chicken B/L", price: 300.00 },
    { name: "Chicken Malaysia B/L", price: 300.00 },
    { name: "Kadai Chicken (B/L, W/B)", price: 280.00 },
    { name: "Chicken Maharani", price: 300.00 },
    { name: "Chicken Sultani", price: 260.00 },
    { name: "Chicken Chettinadu B/L", price: 260.00 },
    { name: "Chicken Kolhapuri", price: 260.00 },
    { name: "Chicken Nawabi", price: 260.00 },
    { name: "Chicken Kalmi Masala (W/B)", price: 440.00 },
    { name: "1/2 Chicken Tandoori Masala", price: 320.00 },
    { name: "Chicken Tandoori Masala (Full)", price: 600.00 },
    { name: "Chicken Lollipop Masala", price: 280.00 },
  ],
  "FISH": [
    { name: "Fish Curry/Fry (Tank)", price: 150.00 },
    { name: "Fish Curry/Fry (Vanjaram)", price: 240.00 },
    { name: "Fish Roast (Tank)", price: 120.00 },
    { name: "Fish Roast (Vanjaram)", price: 220.00 },
    { name: "Chilli Fish", price: 300.00 },
    { name: "Fish Apollo", price: 300.00 },
  ],
  "MUTTON DISHES": [
    { name: "Mutton Curry", price: 330.00 },
    { name: "Mutton Fry", price: 360.00 },
    { name: "Ginger Mutton", price: 360.00 },
    { name: "Gongura Mutton", price: 360.00 },
    { name: "Mutton Dopayaza", price: 360.00 },
  ],
  "PRAWN DISHES": [
    { name: "Prawn Fry", price: 300.00 },
    { name: "Prawn Curry", price: 280.00 },
    { name: "Ginger Prawn", price: 300.00 },
    { name: "Butter Prawn", price: 300.00 },
    { name: "Chilli Prawn", price: 320.00 },
    { name: "Prawn 65", price: 320.00 },
  ],
};

async function seedMenu() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB connected");

    // Clear existing menu items and categories
    console.log("\nClearing existing menu items and categories...");
    await MenuItem.deleteMany({});
    await Category.deleteMany({});
    console.log("✓ Cleared existing data");

    let totalItems = 0;
    let totalCategories = 0;

    // Create categories and menu items
    for (const [categoryName, items] of Object.entries(menuData)) {
      console.log(`\nProcessing category: ${categoryName}`);

      // Create category
      const category = await Category.create({
        name: categoryName,
      });
      totalCategories++;
      console.log(`  ✓ Created category: ${categoryName}`);

      // Create menu items for this category
      for (const item of items) {
        await MenuItem.create({
          name: item.name,
          price: item.price,
          category: category._id,
          isAvailable: true,
        });
        totalItems++;
      }
      console.log(`  ✓ Added ${items.length} items to ${categoryName}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✓ MENU SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log(`Total Categories: ${totalCategories}`);
    console.log(`Total Menu Items: ${totalItems}`);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error seeding menu:", error);
    process.exit(1);
  }
}

// Run the seed function
seedMenu();
