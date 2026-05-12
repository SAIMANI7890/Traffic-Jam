import express from "express";
import { body } from "express-validator";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updateOrderItems,
  deleteOrder,
  getOrderStats,
  toggleItemDelivered,
  getKitchenOrders,
  updateKitchenStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Get all orders (staff and admin)
router.get("/", getOrders);

// Get kitchen orders (all layouts)
router.get("/kitchen/all", getKitchenOrders);

// Get order statistics (admin only)
router.get("/stats", adminOnly, getOrderStats);

// Get single order
router.get("/:id", getOrder);

// Create new order (staff and admin)
router.post(
  "/",
  [
    body("items").isArray({ min: 1 }).withMessage("Items array is required"),
    body("tableId").trim().notEmpty().withMessage("Table ID is required"),
  ],
  createOrder,
);

// Update order status
router.patch(
  "/:id/status",
  [
    body("status")
      .isIn(["open", "in_progress", "completed", "cancelled", "paid"])
      .withMessage("Invalid status"),
  ],
  updateOrderStatus,
);

// Toggle item delivered status (staff tracking)
router.patch(
  "/:id/item-delivered",
  [
    body("itemIndex").isInt({ min: 0 }).withMessage("Valid item index is required"),
    body("delivered").isBoolean().withMessage("Delivered must be a boolean"),
  ],
  toggleItemDelivered,
);

// Update kitchen status for an item
router.patch(
  "/:id/kitchen-status",
  [
    body("itemIndex").isInt({ min: 0 }).withMessage("Valid item index is required"),
    body("kitchenStatus")
      .isIn(["pending", "preparing", "completed"])
      .withMessage("Invalid kitchen status"),
  ],
  updateKitchenStatus,
);

// Update order items
router.patch(
  "/:id/items",
  [body("items").isArray().withMessage("Items must be an array")],
  updateOrderItems,
);

// Delete order (admin only)
router.delete("/:id", adminOnly, deleteOrder);

export default router;
