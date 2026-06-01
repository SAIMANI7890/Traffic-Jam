import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    delivered: { type: Boolean, default: false }, // Track if item has been delivered to table
    cancelled: { type: Boolean, default: false }, // Track if item has been cancelled
    kitchenStatus: {
      type: String,
      enum: ["pending", "preparing", "completed"],
      default: "pending",
    }, // Track kitchen preparation status
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], default: [] },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled", "paid"],
      default: "open",
    },
    tableId: { type: String },
    layoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Layout" }, // Link order to specific layout
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paidAt: { type: Date }, // Timestamp when bill was paid
    isParcel: { type: Boolean, default: false }, // Flag for parcel/takeaway orders
    customerName: { type: String }, // Customer name for parcel orders
    customerPhone: { type: String }, // Customer phone for parcel orders
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
