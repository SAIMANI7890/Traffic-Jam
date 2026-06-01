import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../services/orderService.js";
import socketService from "../services/socketService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function StaffParcelOrders() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [itemsToCancel, setItemsToCancel] = useState([]);

  useEffect(() => {
    loadOrders();

    // Connect to Socket.IO for real-time updates
    if (token) {
      socketService.connect(token);

      socketService.on("order:create", handleOrderCreate);
      socketService.on("order:update", handleOrderUpdate);
      socketService.on("order:delete", handleOrderDelete);
    }

    return () => {
      socketService.off("order:create", handleOrderCreate);
      socketService.off("order:update", handleOrderUpdate);
      socketService.off("order:delete", handleOrderDelete);
    };
  }, [token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Filter parcel orders for today
      const response = await orderService.getOrders({
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
      });
      
      // Filter only parcel orders
      const parcelOrders = (response.orders || []).filter(order => order.isParcel);
      setOrders(parcelOrders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreate = (newOrder) => {
    // Only add parcel orders
    if (newOrder.isParcel) {
      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    // Only update if it's a parcel order
    if (updatedOrder.isParcel) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    }
  };

  const handleOrderDelete = ({ orderId }) => {
    setOrders((prev) => prev.filter((order) => order._id !== orderId));
  };

  const handleToggleItemDelivered = async (orderId, itemIndex, currentStatus) => {
    try {
      await orderService.toggleItemDelivered(orderId, itemIndex, !currentStatus);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update item status");
    }
  };

  const handleMarkPaid = async (orderId) => {
    if (!confirm("Confirm that the bill has been paid?")) return;

    try {
      await orderService.updateOrderStatus(orderId, "paid");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark order as paid");
    }
  };

  const handleStartCancellation = (orderId) => {
    setCancellingOrderId(orderId);
    setItemsToCancel([]);
  };

  const handleCancelCancellation = () => {
    setCancellingOrderId(null);
    setItemsToCancel([]);
  };

  const handleToggleItemForCancellation = (itemIndex) => {
    setItemsToCancel((prev) => {
      if (prev.includes(itemIndex)) {
        return prev.filter((idx) => idx !== itemIndex);
      } else {
        return [...prev, itemIndex];
      }
    });
  };

  const handleConfirmCancellation = async (orderId) => {
    if (itemsToCancel.length === 0) {
      alert("Please select at least one item to cancel");
      return;
    }

    if (!confirm(`Cancel ${itemsToCancel.length} item(s) from this order?`)) {
      return;
    }

    try {
      const order = orders.find((o) => o._id === orderId);
      if (!order) return;

      const updatedItems = order.items.map((item, idx) => {
        if (itemsToCancel.includes(idx)) {
          return { ...item, cancelled: true };
        }
        return item;
      });

      const allCancelled = updatedItems.every(item => item.cancelled === true);

      if (allCancelled) {
        await orderService.updateOrderStatus(orderId, "cancelled");
      } else {
        await orderService.updateOrderItems(orderId, updatedItems);
      }

      setCancellingOrderId(null);
      setItemsToCancel([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel items");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "paid":
        return "bg-green-200 text-green-800 font-semibold";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "PLACED";
      case "in_progress":
        return "SERVED";
      case "completed":
        return "SERVED";
      case "paid":
        return "PAID";
      case "cancelled":
        return "CANCELLED";
      default:
        return status;
    }
  };

  const getKitchenStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKitchenStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Pending";
      case "preparing":
        return "👨‍🍳 Preparing";
      case "completed":
        return "✅ Ready";
      default:
        return "⏳ Pending";
    }
  };

  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      if (item.cancelled) return sum;
      return sum + (item.price || 0) * (item.qty || 0);
    }, 0);
  };

  // Sort orders: active first, then paid/cancelled
  const sortedOrders = orders.sort((a, b) => {
    const aIsInactive = a.status === "paid" || a.status === "cancelled";
    const bIsInactive = b.status === "paid" || b.status === "cancelled";
    
    if (aIsInactive && !bIsInactive) return 1;
    if (!aIsInactive && bIsInactive) return -1;
    
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading parcel orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/staff/home")}
            className="mb-2 text-sm text-blue-600 hover:underline"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold">📦 Parcel Orders</h1>
          <p className="mt-1 text-gray-600">
            Today's parcel/takeaway orders
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
          <button
            onClick={() => navigate("/staff/parcel")}
            className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            + New Parcel Order
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {sortedOrders.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-600">
                No parcel orders today
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Parcel orders will appear here when created
              </p>
            </div>
          </div>
        ) : (
          sortedOrders.map((order) => (
            <div
              key={order._id}
              className={`rounded-lg border p-6 shadow transition-all hover:shadow-md ${
                order.status === "paid" 
                  ? "border-green-500 bg-green-50" 
                  : order.status === "cancelled"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Order Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">
                      📦 Parcel Order
                    </h3>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "N/A"}
                  </div>
                  {order.customerName && (
                    <div className="mt-1 text-sm font-medium text-gray-700">
                      Customer: {order.customerName}
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="mt-1 text-sm text-gray-600">
                      Phone: {order.customerPhone}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold">
                    ₹{calculateOrderTotal(order.items).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Items:</div>
                {order.items &&
                  Array.isArray(order.items) &&
                  order.items.map((item, idx) => {
                    const isItemCancelled = item.cancelled || order.status === "cancelled";
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded p-3 ${
                          isItemCancelled 
                            ? "bg-red-50 border border-red-200" 
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {cancellingOrderId === order._id ? (
                            <input
                              type="checkbox"
                              checked={itemsToCancel.includes(idx)}
                              onChange={() => handleToggleItemForCancellation(idx)}
                              disabled={item.cancelled}
                              className="h-5 w-5 cursor-pointer accent-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={item.delivered || false}
                              onChange={() =>
                                handleToggleItemDelivered(
                                  order._id,
                                  idx,
                                  item.delivered
                                )
                              }
                              disabled={isItemCancelled}
                              className="h-5 w-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          )}
                          <div className="flex-1">
                            <div
                              className={`font-medium ${
                                isItemCancelled 
                                  ? "text-red-600 line-through" 
                                  : item.delivered 
                                  ? "text-gray-400 line-through" 
                                  : ""
                              }`}
                            >
                              {item.name || "Unknown Item"}
                              {isItemCancelled && (
                                <span className="ml-2 text-xs font-semibold text-red-600">
                                  (CANCELLED)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className={isItemCancelled ? "text-red-600" : ""}>
                                Qty: {item.qty || 0} × ₹{(item.price || 0).toFixed(2)}
                              </span>
                              {!isItemCancelled && (
                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${getKitchenStatusColor(item.kitchenStatus || "pending")}`}>
                                  {getKitchenStatusLabel(item.kitchenStatus || "pending")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`font-medium ${isItemCancelled ? "text-red-600 line-through" : ""}`}>
                          ₹{((item.qty || 0) * (item.price || 0)).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-4 rounded bg-yellow-50 p-3 text-sm">
                  <span className="font-medium">Notes:</span> {order.notes}
                </div>
              )}

              {/* Action Buttons */}
              {order.status !== "paid" && order.status !== "cancelled" && (
                <div className="mt-4">
                  {cancellingOrderId === order._id ? (
                    <div className="space-y-2">
                      <div className="rounded bg-red-50 p-3 text-sm text-red-700">
                        Select items to cancel and click "Done" to confirm
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmCancellation(order._id)}
                          className="flex-1 rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                        >
                          Done ({itemsToCancel.length} selected)
                        </button>
                        <button
                          onClick={handleCancelCancellation}
                          className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkPaid(order._id)}
                        className="flex-1 rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                      >
                        💰 Bill Paid
                      </button>
                      <button
                        onClick={() => handleStartCancellation(order._id)}
                        className="flex-1 rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                      >
                        ❌ Cancel Items
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
