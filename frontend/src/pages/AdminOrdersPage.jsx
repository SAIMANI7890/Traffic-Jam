import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../services/orderService.js";
import socketService from "../services/socketService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadData();

    // Connect to Socket.IO
    if (token) {
      socketService.connect(token);

      // Listen for real-time order updates
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        orderService.getOrders(),
        orderService.getOrderStats(),
      ]);
      setOrders(ordersRes.orders || []);
      setStats(statsRes);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreate = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    loadData(); // Reload to update stats
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order,
      ),
    );
    loadData(); // Reload to update stats
  };

  const handleOrderDelete = ({ orderId }) => {
    setOrders((prev) => prev.filter((order) => order._id !== orderId));
    loadData(); // Reload to update stats
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
        return "bg-green-200 text-green-800";
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
        return "PREPARING";
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

  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      // Don't include cancelled items in the total
      if (item.cancelled) return sum;
      return sum + (item.price || 0) * (item.qty || 0);
    }, 0);
  };

  // Filter orders based on selected status
  const filteredOrders = filterStatus === "unpaid"
    ? orders.filter((order) => order.status !== "paid")
    : filterStatus
    ? orders.filter((order) => order.status === filterStatus)
    : orders;

  // Calculate stats for filtered orders
  const filteredStats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => {
      // Don't include cancelled orders in revenue
      if (order.status === "cancelled") return sum;
      return sum + calculateOrderTotal(order.items);
    }, 0),
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/kitchen")}
            className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            👨‍🍳 Kitchen View
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats Summary */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border bg-white p-6 shadow">
            <div className="text-sm text-gray-600">
              {filterStatus === "paid"
                ? "Paid Orders"
                : filterStatus === "unpaid"
                ? "Unpaid Orders"
                : filterStatus
                ? `${getStatusLabel(filterStatus)} Orders`
                : "Total Orders Today"}
            </div>
            <div className="mt-2 text-3xl font-bold">{filteredStats.totalOrders}</div>
          </div>
          <div className="rounded border bg-white p-6 shadow">
            <div className="text-sm text-gray-600">
              {filterStatus === "paid"
                ? "Paid Revenue"
                : filterStatus === "unpaid"
                ? "Unpaid Revenue"
                : filterStatus
                ? `${getStatusLabel(filterStatus)} Revenue`
                : "Total Revenue Today"}
            </div>
            <div className="mt-2 text-3xl font-bold">
              ₹{filteredStats.totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="rounded border bg-white p-4 shadow">
        <label className="mr-2 text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded border p-2"
        >
          <option value="">All Orders</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="open">Placed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded border bg-white p-8 text-center text-gray-500 shadow">
            No orders found
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`rounded border p-6 shadow transition-all hover:shadow-md ${
                order.status === "paid"
                  ? "border-green-500 bg-green-50"
                  : order.status === "cancelled"
                  ? "border-red-500 bg-red-50"
                  : "bg-white"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      Table: {order.tableId || 'N/A'}
                    </h3>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                  </div>
                  {order.createdBy && (
                    <div className="mt-1 text-sm text-gray-500">
                      Staff: {order.createdBy.username || 'Unknown'}
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

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Items:</div>
                {order.items && Array.isArray(order.items) && order.items.map((item, idx) => {
                  // If order is cancelled, treat all items as cancelled for display
                  const isItemCancelled = item.cancelled || order.status === "cancelled";
                  
                  return (
                    <div
                      key={idx}
                      className={`flex justify-between rounded p-3 ${
                        isItemCancelled 
                          ? "bg-red-50 border border-red-200" 
                          : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${isItemCancelled ? "text-red-600 line-through" : ""}`}>
                          {item.name || 'Unknown Item'}
                          {isItemCancelled && (
                            <span className="ml-2 text-xs font-semibold text-red-600">
                              (CANCELLED)
                            </span>
                          )}
                        </div>
                        <div className={`text-sm ${isItemCancelled ? "text-red-600" : "text-gray-600"}`}>
                          Qty: {item.qty || 0} × ₹{(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className={`font-medium ${isItemCancelled ? "text-red-600 line-through" : ""}`}>
                        ₹{((item.qty || 0) * (item.price || 0)).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.notes && (
                <div className="mt-4 rounded bg-yellow-50 p-3 text-sm">
                  <span className="font-medium">Notes:</span> {order.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
