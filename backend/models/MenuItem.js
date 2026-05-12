import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
