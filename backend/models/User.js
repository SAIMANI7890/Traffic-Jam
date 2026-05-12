import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // Allow null for staff users created by admin
    },
    role: { type: String, enum: ["admin", "staff"], required: true },
    pin: { type: String, select: false }, // Hashed PIN for admin and admin-created staff
    password: { type: String, select: false }, // Hashed password for staff with email/password login
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // Points to admin user for staff, self for admin (not required initially)
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.comparePin = async function comparePin(pin) {
  if (!this.pin) return false;
  return bcrypt.compare(pin, this.pin);
};

userSchema.pre("save", async function hashSecrets(next) {
  try {
    // Hash PIN if modified (but not if it's already hashed)
    if (this.isModified("pin") && this.pin && !this.pin.startsWith("$2")) {
      this.pin = await bcrypt.hash(this.pin, 12);
    }

    // Hash password if modified (but not if it's already hashed)
    if (this.isModified("password") && this.password && !this.password.startsWith("$2")) {
      this.password = await bcrypt.hash(this.password, 12);
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.pin;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
