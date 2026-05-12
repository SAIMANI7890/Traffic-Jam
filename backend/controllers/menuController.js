import MenuItem from "../models/MenuItem.js";
import Category from "../models/Category.js";

// Get all menu items with populated categories
export const getMenuItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const items = await MenuItem.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single menu item
export const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate(
      "category",
      "name",
    );

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // If category is provided as a string (new category name), create it
    let categoryId = category;
    if (category && typeof category === "string" && category.trim()) {
      const existingCategory = await Category.findOne({
        name: category.trim(),
      });
      if (existingCategory) {
        categoryId = existingCategory._id;
      } else {
        const newCategory = await Category.create({ name: category.trim() });
        categoryId = newCategory._id;
      }
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category: categoryId || null,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const populatedItem = await MenuItem.findById(item._id).populate(
      "category",
      "name",
    );

    res.status(201).json({ item: populatedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Handle category update
    let categoryId = category;
    if (category && typeof category === "string" && category.trim()) {
      const existingCategory = await Category.findOne({
        name: category.trim(),
      });
      if (existingCategory) {
        categoryId = existingCategory._id;
      } else {
        const newCategory = await Category.create({ name: category.trim() });
        categoryId = newCategory._id;
      }
    }

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (categoryId !== undefined) item.category = categoryId || null;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await item.save();

    const updatedItem = await MenuItem.findById(item._id).populate(
      "category",
      "name",
    );

    res.json({ item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await item.deleteOne();

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name: name.trim() });

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if any menu items use this category
    const itemsCount = await MenuItem.countDocuments({ category: category._id });
    if (itemsCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. ${itemsCount} menu item(s) are using it.`,
      });
    }

    await category.deleteOne();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
