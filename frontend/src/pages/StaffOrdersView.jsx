import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import orderService from "../services/orderService.js";
import socketService from "../services/socketService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function StaffOrdersView() {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState(""); // Filter by table

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
      // Filter orders by layoutId
      const response = await orderService.getOrders({ layoutId });
      setOrders(response.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreate = (newOrder) => {
    // Only add order if it belongs to this layout
    if (newOrder.layoutId === layoutId) {
      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    // Only update order if it belongs to this layout
    if (updatedOrder.layoutId === layoutId) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    }
  };

  const handleOrderDelete = ({ orderId }) => {
    // Remove order regardless of layout (it might have been in this layout)
    setOrders((prev) => prev.filter((order) => order._id !== orderId));
  };

  const handleToggleItemDelivered = async (orderId, itemIndex, currentStatus) => {
    try {
      await orderService.toggleItemDelivered(orderId, itemIndex, !currentStatus);
      // Order will be updated via Socket.IO
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update item status");
    }
  };

  const handleMarkPaid = async (orderId) => {
    if (!confirm("Confirm that the bill has been paid?")) return;

    try {
      await orderService.updateOrderStatus(orderId, "paid");
      // Order will be updated via Socket.IO
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark order as paid");
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
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
  };

  // Show all orders, sort by status (active first) then by creation time (FCFS)
  const activeOrders = orders
    .filter((order) => {
      // Filter by selected table if any
      if (selectedTable && order.tableId !== selectedTable) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Paid orders go to bottom
      if (a.status === "paid" && b.status !== "paid") return 1;
      if (a.status !== "paid" && b.status === "paid") return -1;
      // Otherwise sort by creation time (FCFS)
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  // Get unique table IDs for filter dropdown
  const uniqueTables = [...new Set(orders.map((order) => order.tableId))].sort();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading orders...</div>
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
            onClick={() => navigate(`/staff/layout/${layoutId}`)}
            className="mb-2 text-sm text-blue-600 hover:underline"
          >
            ← Back to layout
          </button>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="mt-1 text-gray-600">
            Track and manage orders (sorted by time - FCFS)
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
          {/* Table Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Filter by Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Tables</option>
              {uniqueTables.map((tableId) => (
                <option key={tableId} value={tableId}>
                  {tableId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {activeOrders.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-600">
                No active orders
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Orders will appear here when customers place them
              </p>
            </div>
          </div>
        ) : (
          activeOrders.map((order) => (
            <div
              key={order._id}
              className={`rounded-lg border p-6 shadow transition-all hover:shadow-md ${
                order.status === "paid" 
                  ? "border-green-500 bg-green-50" 
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Order Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">
                      Table: {order.tableId || "N/A"}
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
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold">
                    ₹{calculateOrderTotal(order.items).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Order Items with Delivery Tracking */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Items:</div>
                {order.items &&
                  Array.isArray(order.items) &&
                  order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-3">
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
                          className="h-5 w-5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div
                            className={`font-medium ${item.delivered ? "text-gray-400 line-through" : ""}`}
                          >
                            {item.name || "Unknown Item"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>
                              Qty: {item.qty || 0} × ₹{(item.price || 0).toFixed(2)}
                            </span>
                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${getKitchenStatusColor(item.kitchenStatus || "pending")}`}>
                              {getKitchenStatusLabel(item.kitchenStatus || "pending")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="font-medium">
                        ₹{((item.qty || 0) * (item.price || 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-4 rounded bg-yellow-50 p-3 text-sm">
                  <span className="font-medium">Notes:</span> {order.notes}
                </div>
              )}

              {/* Bill Paid Button - Show for all non-paid orders */}
              {order.status !== "paid" && (
                <div className="mt-4">
                  <button
                    onClick={() => handleMarkPaid(order._id)}
                    className="w-full rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                  >
                    💰 Bill Paid
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
