import express from "express";
import { body } from "express-validator";
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/menuController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Menu items routes
router.get("/items", getMenuItems);
router.get("/items/:id", getMenuItem);

router.post(
  "/items",
  protect,
  adminOnly,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ],
  createMenuItem,
);

router.put(
  "/items/:id",
  protect,
  adminOnly,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ],
  updateMenuItem,
);

router.delete("/items/:id", protect, adminOnly, deleteMenuItem);

// Categories routes
router.get("/categories", getCategories);

router.post(
  "/categories",
  protect,
  adminOnly,
  [body("name").trim().notEmpty().withMessage("Category name is required")],
  createCategory,
);

router.delete("/categories/:id", protect, adminOnly, deleteCategory);

export default router;
