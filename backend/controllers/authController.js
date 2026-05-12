import mongoose from "mongoose";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const badRequest = (res, message) => res.status(400).json({ message });
const unauthorized = (res, message) => res.status(401).json({ message });

const toPublicUser = (user) => ({
  id: user.id || user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  organizationId: user.organizationId,
});

// ==================== ADMIN SIGNUP ====================
export const signupAdmin = async (req, res) => {
  try {
    const { username, email, pin, confirmPin } = req.body;

    // Validation
    if (!username || !email || !pin || !confirmPin) {
      return badRequest(
        res,
        "Username, email, PIN, and confirm PIN are required",
      );
    }

    if (!/^\d{4}$/.test(String(pin))) {
      return badRequest(res, "PIN must be exactly 4 digits");
    }

    if (pin !== confirmPin) {
      return badRequest(res, "PIN and confirm PIN do not match");
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (existingUser) {
      return badRequest(res, "Email already in use");
    }

    // Create admin user with temporary organizationId
    const admin = await User.create({
      username: String(username).trim(),
      email: String(email).toLowerCase().trim(),
      pin: String(pin),
      role: "admin",
      organizationId: new mongoose.Types.ObjectId(), // Temporary ID
    });

    // Update organizationId to point to self
    await User.updateOne(
      { _id: admin._id },
      { $set: { organizationId: admin._id } }
    );

    // Fetch updated admin
    const updatedAdmin = await User.findById(admin._id);

    const token = generateToken({
      id: updatedAdmin._id.toString(),
      role: updatedAdmin.role,
      organizationId: updatedAdmin.organizationId.toString(),
    });

    return res.status(201).json({ token, user: toPublicUser(updatedAdmin) });
  } catch (error) {
    console.error("Admin signup error:", error);
    return res.status(500).json({ message: error.message || "Server error during signup" });
  }
};

// ==================== ADMIN LOGIN ====================
export const loginAdmin = async (req, res) => {
  try {
    const { email, pin } = req.body;

    // Validation
    if (!email || !pin) {
      return badRequest(res, "Email and PIN are required");
    }

    if (!/^\d{4}$/.test(String(pin))) {
      return badRequest(res, "PIN must be exactly 4 digits");
    }

    // Find admin user
    const admin = await User.findOne({
      email: String(email).toLowerCase().trim(),
      role: "admin",
    }).select("+pin");

    if (!admin) {
      return unauthorized(res, "Invalid credentials");
    }

    // Verify PIN
    const pinOk = await admin.comparePin(String(pin));
    if (!pinOk) {
      return unauthorized(res, "Invalid credentials");
    }

    const token = generateToken({
      id: admin._id.toString(),
      role: admin.role,
      organizationId: admin.organizationId.toString(),
    });

    return res.json({ token, user: toPublicUser(admin) });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ==================== STAFF LOGIN ====================
export const loginStaff = async (req, res) => {
  try {
    const { username, pin, email, password } = req.body;

    // Support two login methods:
    // 1. Username + Admin's PIN (existing method)
    // 2. Email + Password (new method for independent staff)

    // Method 1: Username + PIN (admin-created staff)
    if (username && pin) {
      // Validation
      if (!/^\d{4}$/.test(String(pin))) {
        return badRequest(res, "PIN must be exactly 4 digits");
      }

      // Find staff user by username
      const staff = await User.findOne({
        username: String(username).trim(),
        role: "staff",
      })
        .select("+pin")
        .populate("organizationId", "username email");

      if (!staff) {
        return unauthorized(res, "Invalid credentials");
      }

      // Get the admin's PIN to compare
      const admin = await User.findById(staff.organizationId).select("+pin");

      if (!admin) {
        return unauthorized(res, "Organization not found");
      }

      // Verify PIN matches admin's PIN
      const pinOk = await admin.comparePin(String(pin));
      if (!pinOk) {
        return unauthorized(res, "Invalid credentials");
      }

      const token = generateToken({
        id: staff._id.toString(),
        role: staff.role,
        organizationId: staff.organizationId._id.toString(),
      });

      return res.json({ token, user: toPublicUser(staff) });
    }

    // Method 2: Email + Password (independent staff)
    if (email && password) {
      // Find staff user by email
      const staff = await User.findOne({
        email: String(email).toLowerCase().trim(),
        role: "staff",
      }).select("+password");

      if (!staff) {
        return unauthorized(res, "Invalid credentials");
      }

      // Verify password
      const passwordOk = await staff.comparePassword(String(password));
      if (!passwordOk) {
        return unauthorized(res, "Invalid credentials");
      }

      const token = generateToken({
        id: staff._id.toString(),
        role: staff.role,
        organizationId: staff.organizationId?.toString() || staff._id.toString(),
      });

      return res.json({ token, user: toPublicUser(staff) });
    }

    return badRequest(res, "Please provide either (username + PIN) or (email + password)");
  } catch (error) {
    console.error("Staff login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ==================== STAFF SIGNUP (Email/Password) ====================
export const signupStaff = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return badRequest(
        res,
        "Username, email, password, and confirm password are required",
      );
    }

    if (password !== confirmPassword) {
      return badRequest(res, "Password and confirm password do not match");
    }

    if (password.length < 6) {
      return badRequest(res, "Password must be at least 6 characters");
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (existingUser) {
      return badRequest(res, "Email already in use");
    }

    // Check if username already exists
    const existingUsername = await User.findOne({
      username: String(username).trim(),
    });

    if (existingUsername) {
      return badRequest(res, "Username already in use");
    }

    // Create staff user
    const staff = await User.create({
      username: String(username).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password),
      role: "staff",
      organizationId: null, // Independent staff, not tied to admin
    });

    const token = generateToken({
      id: staff._id.toString(),
      role: staff.role,
      organizationId: staff._id.toString(), // Self-organization
    });

    return res.status(201).json({ token, user: toPublicUser(staff) });
  } catch (error) {
    console.error("Staff signup error:", error);
    return res.status(500).json({ message: error.message || "Server error during signup" });
  }
};

// ==================== CHANGE ADMIN PIN ====================
export const changeAdminPin = async (req, res) => {
  try {
    const { currentPin, newPin, confirmNewPin } = req.body;

    // Validation
    if (!currentPin || !newPin || !confirmNewPin) {
      return badRequest(
        res,
        "Current PIN, new PIN, and confirm new PIN are required",
      );
    }

    if (!/^\d{4}$/.test(String(newPin))) {
      return badRequest(res, "New PIN must be exactly 4 digits");
    }

    if (newPin !== confirmNewPin) {
      return badRequest(res, "New PIN and confirm PIN do not match");
    }

    if (currentPin === newPin) {
      return badRequest(res, "New PIN must be different from current PIN");
    }

    // Get admin user with PIN
    const admin = await User.findById(req.user.id).select("+pin");

    if (!admin || admin.role !== "admin") {
      return unauthorized(res, "Not authorized");
    }

    // Verify current PIN
    const pinOk = await admin.comparePin(String(currentPin));
    if (!pinOk) {
      return unauthorized(res, "Current PIN is incorrect");
    }

    // Update PIN
    admin.pin = String(newPin);
    await admin.save();

    return res.json({ message: "PIN changed successfully" });
  } catch (error) {
    console.error("Change PIN error:", error);
    return res.status(500).json({ message: "Server error during PIN change" });
  }
};

// ==================== GET ADMIN PIN (for sharing with staff) ====================
export const getAdminPin = async (req, res) => {
  try {
    // Only admin can access this
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const admin = await User.findById(req.user.id).select("+pin");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Note: In production, you might want to add additional security here
    // For now, we'll return a message that PIN can be shared offline
    return res.json({
      message:
        "Share your PIN with staff members offline for them to login. They will use their username and your PIN.",
      pinLength: 4,
      pinType: "numeric",
    });
  } catch (error) {
    console.error("Get PIN error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
