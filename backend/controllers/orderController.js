import Order from "../models/Order.js";

// Get all orders with optional filters
export const getOrders = async (req, res) => {
  try {
    const { status, tableId, layoutId, startDate, endDate } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (tableId) {
      filter.tableId = tableId;
    }

    if (layoutId) {
      filter.layoutId = layoutId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const orders = await Order.find(filter)
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { items, tableId, layoutId, notes, isParcel, customerName, customerPhone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must have at least one item" });
    }

    if (!tableId) {
      return res.status(400).json({ message: "Table ID is required" });
    }

    // For parcel orders, layoutId is optional
    if (!isParcel && !layoutId) {
      return res.status(400).json({ message: "Layout ID is required for dine-in orders" });
    }

    const orderData = {
      items,
      tableId,
      layoutId: layoutId || null,
      notes: notes || "",
      status: "open",
      createdBy: req.user.id,
      isParcel: isParcel || false,
    };

    // Add customer info for parcel orders
    if (isParcel) {
      if (customerName) orderData.customerName = customerName;
      if (customerPhone) orderData.customerPhone = customerPhone;
    }

    const order = await Order.create(orderData);

    const populatedOrder = await Order.findById(order._id)
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name")
      .populate("layoutId", "name");

    // Emit Socket.IO event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("order:create", populatedOrder);
    }

    res.status(201).json({ order: populatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["open", "in_progress", "completed", "cancelled", "paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    
    // If marking as paid, set payment timestamp
    if (status === "paid") {
      order.paidAt = new Date();
    }
    
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name");

    // Emit Socket.IO event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("order:update", updatedOrder);
    }

    res.json({ order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order items (add/remove/modify items)
export const updateOrderItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Items array is required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.items = items;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name");

    // Emit Socket.IO event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("order:update", updatedOrder);
    }

    res.json({ order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    // Emit Socket.IO event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("order:delete", { orderId: req.params.id });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle item delivered status (for staff tracking)
export const toggleItemDelivered = async (req, res) => {
  try {
    const { itemIndex, delivered } = req.body;

    if (itemIndex === undefined || delivered === undefined) {
      return res.status(400).json({ message: "Item index and delivered status are required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (itemIndex < 0 || itemIndex >= order.items.length) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    // Update the delivered status for the specific item
    order.items[itemIndex].delivered = delivered;
    
    // Check if all items are delivered
    const allDelivered = order.items.every(item => item.delivered === true);
    
    // If all items delivered and status is in_progress, update to completed
    if (allDelivered && order.status === "in_progress") {
      order.status = "completed";
    }
    
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name");

    // Emit Socket.IO event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("order:update", updatedOrder);
    }

    res.json({ order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order statistics (for admin dashboard)
export const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({
      createdAt: { $gte: today },
    });

    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (itemSum, item) => itemSum + item.price * item.qty,
        0,
      );
      return sum + orderTotal;
    }, 0);

    const ordersByStatus = await Order.aggregate([
      {
        $match: { createdAt: { $gte: today } },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalOrders,
      totalRevenue,
      ordersByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for kitchen view (all layouts)
export const getKitchenOrders = async (req, res) => {
  try {
    // Get orders that are not cancelled or paid
    const orders = await Order.find({
      status: { $nin: ["cancelled", "paid"] },
    })
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name")
      .populate("layoutId", "name")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update kitchen status for a specific item in an order
export const updateKitchenStatus = async (req, res) => {
  try {
    const { itemIndex, kitchenStatus } = req.body;

    if (itemIndex === undefined || !kitchenStatus) {
      return res.status(400).json({ message: "Item index and kitchen status are required" });
    }

    const validStatuses = ["pending", "preparing", "completed"];
    if (!validStatuses.includes(kitchenStatus)) {
      return res.status(400).json({ message: "Invalid kitchen status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (itemIndex < 0 || itemIndex >= order.items.length) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    // Update the kitchen status for the specific item
    order.items[itemIndex].kitchenStatus = kitchenStatus;
    
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("createdBy", "username email")
      .populate("items.menuItem", "name")
      .populate("layoutId", "name");

    // Emit Socket.IO event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("order:update", updatedOrder);
      io.emit("kitchen:update", updatedOrder);
    }

    res.json({ order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
