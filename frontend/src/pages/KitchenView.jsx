import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../services/orderService.js";
import socketService from "../services/socketService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function KitchenView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadKitchenOrders();
    
    // Connect to socket for real-time updates
    socketService.connect();

    // Listen for order updates
    const handleOrderUpdate = (updatedOrder) => {
      setOrders((prevOrders) => {
        const index = prevOrders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          const newOrders = [...prevOrders];
          newOrders[index] = updatedOrder;
          return newOrders;
        }
        return prevOrders;
      });
    };

    const handleOrderCreate = (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    const handleOrderDelete = ({ orderId }) => {
      setOrders((prevOrders) => prevOrders.filter((o) => o._id !== orderId));
    };

    socketService.on("order:update", handleOrderUpdate);
    socketService.on("order:create", handleOrderCreate);
    socketService.on("order:delete", handleOrderDelete);
    socketService.on("kitchen:update", handleOrderUpdate);

    return () => {
      socketService.off("order:update", handleOrderUpdate);
      socketService.off("order:create", handleOrderCreate);
      socketService.off("order:delete", handleOrderDelete);
      socketService.off("kitchen:update", handleOrderUpdate);
    };
  }, []);

  const loadKitchenOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getKitchenOrders();
      setOrders(response.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load kitchen orders");
    } finally {
      setLoading(false);
    }
  };

  const handleKitchenStatusChange = async (orderId, itemIndex, newStatus) => {
    try {
      await orderService.updateKitchenStatus(orderId, itemIndex, newStatus);
      // The socket will handle the update
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update kitchen status");
    }
  };

  const getKitchenStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getOrderCardColor = (order) => {
    // Check if all non-cancelled items in the order are completed
    const nonCancelledItems = order.items.filter(item => !item.cancelled);
    const allItemsCompleted = nonCancelledItems.length > 0 && nonCancelledItems.every(
      (item) => item.kitchenStatus === "completed"
    );
    
    if (allItemsCompleted) {
      return "bg-green-50 border-green-400 border-2";
    }
    
    // Parcel orders get light pink background
    if (order.isParcel) {
      return "bg-pink-50 border-pink-300 border-2";
    }
    
    return "bg-white border-gray-200";
  };

  const isOrderCompleted = (order) => {
    const nonCancelledItems = order.items.filter(item => !item.cancelled);
    return nonCancelledItems.length > 0 && nonCancelledItems.every((item) => item.kitchenStatus === "completed");
  };

  // Sort orders: incomplete orders first (FCFS), then completed orders (FCFS)
  const sortedOrders = [...orders].sort((a, b) => {
    const aCompleted = isOrderCompleted(a);
    const bCompleted = isOrderCompleted(b);

    // If one is completed and the other is not, incomplete comes first
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    // If both have the same completion status, sort by creation time (FCFS)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const handleGoBack = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/staff/home");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading kitchen orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kitchen View</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            All orders from all layouts (FCFS Order)
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="w-full sm:w-auto rounded bg-gray-600 px-4 py-2 text-sm sm:text-base text-white hover:bg-gray-700"
        >
          ← Back to {user?.role === "admin" ? "Dashboard" : "Home"}
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-600">
              No active orders
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Orders will appear here when they are created
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sortedOrders.map((order, orderIndex) => {
            const isCompleted = isOrderCompleted(order);
            // Calculate order number only for incomplete orders
            const incompleteOrdersBefore = sortedOrders
              .slice(0, orderIndex)
              .filter((o) => !isOrderCompleted(o)).length;
            const orderNumber = isCompleted ? null : incompleteOrdersBefore + 1;

            return (
              <div
                key={order._id}
                className={`rounded-lg border p-4 sm:p-6 shadow transition-all ${getOrderCardColor(order)}`}
              >
                <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {orderNumber && (
                        <span className="text-base sm:text-lg font-bold text-gray-500">
                          #{orderNumber}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          ✅
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl font-semibold">
                        {order.isParcel ? "📦 PARCEL" : `Table ${order.tableId}`}
                      </h3>
                      {!order.isParcel && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 whitespace-nowrap">
                          {order.layoutId?.name || "Unknown Layout"}
                        </span>
                      )}
                      {order.isParcel && order.customerName && (
                        <span className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 whitespace-nowrap">
                          {order.customerName}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Order #{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleTimeString()}
                      {order.isParcel && order.customerPhone && ` • ${order.customerPhone}`}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
                      order.status === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {order.notes && (
                  <div className="mb-3 sm:mb-4 rounded bg-yellow-50 p-2 sm:p-3 text-xs sm:text-sm">
                    <span className="font-medium">Note:</span> {order.notes}
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  {order.items.map((item, index) => {
                    // If order is cancelled, treat all items as cancelled for display
                    const isItemCancelled = item.cancelled || order.status === "cancelled";
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between gap-2 rounded border p-2 sm:p-3 ${
                          isItemCancelled 
                            ? "bg-red-50 border-red-200 opacity-60" 
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`text-sm sm:text-base font-medium truncate ${
                            isItemCancelled ? "text-red-600 line-through" : ""
                          }`}>
                            {item.name}
                            {isItemCancelled && (
                              <span className="ml-2 text-xs font-semibold text-red-600">
                                (CANCELLED)
                              </span>
                            )}
                          </span>
                          <span className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                            isItemCancelled ? "bg-red-100 text-red-600" : "bg-gray-100"
                          }`}>
                            x{item.qty}
                          </span>
                        </div>
                        {!isItemCancelled ? (
                          <select
                            value={item.kitchenStatus || "pending"}
                            onChange={(e) =>
                              handleKitchenStatusChange(
                                order._id,
                                index,
                                e.target.value
                              )
                            }
                            className={`rounded border px-2 py-1 text-xs sm:text-sm font-medium w-[110px] sm:w-[130px] flex-shrink-0 ${getKitchenStatusColor(
                              item.kitchenStatus || "pending"
                            )}`}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="preparing">👨‍🍳 Preparing</option>
                            <option value="completed">✅ Completed</option>
                          </select>
                        ) : (
                          <span className="rounded border border-red-300 bg-red-100 px-2 py-1 text-xs sm:text-sm font-medium text-red-700 w-[110px] sm:w-[130px] flex-shrink-0 text-center">
                            ❌ Cancelled
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t pt-3 sm:pt-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Created by: {order.createdBy?.username || "Unknown"}
                  </div>
                  <div className="text-base sm:text-lg font-bold">
                    Total: ₹
                    {order.items
                      .filter(item => !item.cancelled)
                      .reduce((sum, item) => sum + item.price * item.qty, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
