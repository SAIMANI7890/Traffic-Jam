import User from "../models/User.js";

// Get all staff users (admin only - from their organization)
export const getStaffUsers = async (req, res) => {
  try {
    const staff = await User.find({
      role: "staff",
      organizationId: req.user.organizationId,
    }).sort({ createdAt: -1 });
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single staff user (admin only)
export const getStaffUser = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      organizationId: req.user.organizationId,
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create staff user (admin only)
export const createStaffUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    // Check if username already exists in this organization
    const existing = await User.findOne({
      username: String(username).trim(),
      organizationId: req.user.organizationId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Username already exists in your organization",
      });
    }

    // Get admin's PIN to set for staff
    const admin = await User.findById(req.user.id).select("+pin");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Create staff with admin's PIN (already hashed)
    const staff = new User({
      username: String(username).trim(),
      role: "staff",
      organizationId: req.user.organizationId,
      pin: admin.pin, // Use admin's hashed PIN directly
    });

    // Skip PIN hashing since it's already hashed
    staff.isModified = () => false;
    await staff.save({ validateBeforeSave: true });

    // Manually set the PIN again after save
    await User.updateOne(
      { _id: staff._id },
      { $set: { pin: admin.pin } },
    );

    res.status(201).json({
      staff: {
        id: staff._id,
        username: staff.username,
        role: staff.role,
        organizationId: staff.organizationId,
      },
      message: "Staff created. They can login with their username and your PIN.",
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update staff user (admin only)
export const updateStaffUser = async (req, res) => {
  try {
    const { username } = req.body;

    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      organizationId: req.user.organizationId,
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    if (username !== undefined) {
      if (!username.trim()) {
        return res.status(400).json({ message: "Username cannot be empty" });
      }

      // Check if username is already in use by another staff in this organization
      const existing = await User.findOne({
        username: String(username).trim(),
        organizationId: req.user.organizationId,
        _id: { $ne: staff._id },
      });

      if (existing) {
        return res.status(400).json({
          message: "Username already in use in your organization",
        });
      }

      staff.username = username.trim();
    }

    await staff.save();

    res.json({
      staff: {
        id: staff._id,
        username: staff.username,
        role: staff.role,
        organizationId: staff.organizationId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete staff user (admin only)
export const deleteStaffUser = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      organizationId: req.user.organizationId,
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    await staff.deleteOne();

    res.json({ message: "Staff user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
