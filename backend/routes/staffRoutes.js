import express from "express";
import { body } from "express-validator";
import {
  getStaffUsers,
  getStaffUser,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
} from "../controllers/staffController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All staff management routes require admin authentication
router.use(protect, adminOnly);

// Get all staff users
router.get("/", getStaffUsers);

// Get single staff user
router.get("/:id", getStaffUser);

// Create new staff user (only username required)
router.post(
  "/",
  [body("username").trim().notEmpty().withMessage("Username is required")],
  createStaffUser,
);

// Update staff user (only username can be updated)
router.put(
  "/:id",
  [
    body("username")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Username cannot be empty"),
  ],
  updateStaffUser,
);

// Delete staff user
router.delete("/:id", deleteStaffUser);

export default router;
