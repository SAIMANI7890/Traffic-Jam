import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Compound index to ensure unique category names per organization
categorySchema.index({ name: 1, organizationId: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
