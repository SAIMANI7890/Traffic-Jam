import Layout from "../models/Layout.js";

// Get all layouts
export const getLayouts = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = { organizationId: req.user.organizationId };

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const layouts = await Layout.find(filter).sort({ createdAt: -1 });

    res.json({ layouts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single layout
export const getLayout = async (req, res) => {
  try {
    const layout = await Layout.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!layout) {
      return res.status(404).json({ message: "Layout not found" });
    }

    res.json({ layout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new layout
export const createLayout = async (req, res) => {
  try {
    const { name, tables, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Layout name is required" });
    }

    if (!tables || !Array.isArray(tables)) {
      return res.status(400).json({ message: "Tables array is required" });
    }

    // Validate table structure
    for (const table of tables) {
      if (!table.tableId || !table.label) {
        return res.status(400).json({
          message: "Each table must have tableId and label",
        });
      }
      if (
        typeof table.x !== "number" ||
        typeof table.y !== "number"
      ) {
        return res.status(400).json({
          message: "Each table must have numeric x and y coordinates",
        });
      }
    }

    const layout = await Layout.create({
      name: name.trim(),
      tables,
      isActive: isActive !== undefined ? isActive : true,
      organizationId: req.user.organizationId,
    });

    res.status(201).json({ layout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update layout
export const updateLayout = async (req, res) => {
  try {
    const { name, tables, isActive } = req.body;

    const layout = await Layout.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!layout) {
      return res.status(404).json({ message: "Layout not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Layout name cannot be empty" });
      }
      layout.name = name.trim();
    }

    if (tables !== undefined) {
      if (!Array.isArray(tables)) {
        return res.status(400).json({ message: "Tables must be an array" });
      }

      // Validate table structure
      for (const table of tables) {
        if (!table.tableId || !table.label) {
          return res.status(400).json({
            message: "Each table must have tableId and label",
          });
        }
        if (
          typeof table.x !== "number" ||
          typeof table.y !== "number"
        ) {
          return res.status(400).json({
            message: "Each table must have numeric x and y coordinates",
          });
        }
      }

      layout.tables = tables;
    }

    if (isActive !== undefined) {
      layout.isActive = isActive;
    }

    await layout.save();

    res.json({ layout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete layout
export const deleteLayout = async (req, res) => {
  try {
    const layout = await Layout.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!layout) {
      return res.status(404).json({ message: "Layout not found" });
    }

    await layout.deleteOne();

    res.json({ message: "Layout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle layout active status
export const toggleLayoutActive = async (req, res) => {
  try {
    const layout = await Layout.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!layout) {
      return res.status(404).json({ message: "Layout not found" });
    }

    layout.isActive = !layout.isActive;
    await layout.save();

    res.json({ layout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
