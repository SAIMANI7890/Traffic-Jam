import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableId: { type: String, required: true },
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    seats: { type: Number, default: 2, min: 1 },
  },
  { _id: false },
);

const layoutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tables: { type: [tableSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Layout = mongoose.model("Layout", layoutSchema);

export default Layout;
