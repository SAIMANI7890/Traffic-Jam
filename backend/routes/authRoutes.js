import express from "express";
import { body, validationResult } from "express-validator";

import {
  signupAdmin,
  loginAdmin,
  loginStaff,
  signupStaff,
  changeAdminPin,
  getAdminPin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: result.array() });
  }
  return next();
};

// ==================== ADMIN ROUTES ====================

// Admin Signup
router.post(
  "/admin/signup",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("pin")
      .isString()
      .matches(/^\d{4}$/)
      .withMessage("PIN must be exactly 4 digits"),
    body("confirmPin")
      .isString()
      .matches(/^\d{4}$/)
      .withMessage("Confirm PIN must be exactly 4 digits"),
  ],
  validate,
  signupAdmin,
);

// Admin Login
router.post(
  "/admin/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("pin")
      .isString()
      .matches(/^\d{4}$/)
      .withMessage("PIN must be exactly 4 digits"),
  ],
  validate,
  loginAdmin,
);

// Change Admin PIN (protected route)
router.post(
  "/admin/change-pin",
  protect,
  adminOnly,
  [
    body("currentPin")
      .isString()
      .matches(/^\d{4}$/)
      .withMessage("Current PIN must be exactly 4 digits"),
    body("newPin")
      .isString()
      .matches(/^\d{4}$/)
      .withMessage("New PIN must be exactly 4 digits"),
    body("confirmNewPin")
      .isString()
      .matches(/^\d{4}$/)
      .withMessage("Confirm new PIN must be exactly 4 digits"),
  ],
  validate,
  changeAdminPin,
);

// Get PIN info (for sharing with staff)
router.get("/admin/pin-info", protect, adminOnly, getAdminPin);

// ==================== STAFF ROUTES ====================

// Staff Signup (Email/Password method)
router.post(
  "/staff/signup",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm password is required"),
  ],
  validate,
  signupStaff,
);

// Staff Login (supports both username+PIN and email+password)
router.post("/staff/login", loginStaff);

export default router;
