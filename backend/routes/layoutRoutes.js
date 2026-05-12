import express from "express";
import { body } from "express-validator";
import {
  getLayouts,
  getLayout,
  createLayout,
  updateLayout,
  deleteLayout,
  toggleLayoutActive,
} from "../controllers/layoutController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all layouts (accessible to all authenticated users)
router.get("/", protect, getLayouts);

// Get single layout (accessible to all authenticated users)
router.get("/:id", protect, getLayout);

// Create new layout (admin only)
router.post(
  "/",
  protect,
  adminOnly,
  [
    body("name").trim().notEmpty().withMessage("Layout name is required"),
    body("tables").isArray().withMessage("Tables must be an array"),
  ],
  createLayout,
);

// Update layout (admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Layout name cannot be empty"),
    body("tables").optional().isArray().withMessage("Tables must be an array"),
  ],
  updateLayout,
);

// Toggle layout active status (admin only)
router.patch("/:id/toggle", protect, adminOnly, toggleLayoutActive);

// Delete layout (admin only)
router.delete("/:id", protect, adminOnly, deleteLayout);

export default router;
