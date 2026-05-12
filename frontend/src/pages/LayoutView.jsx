import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import layoutService from "../services/layoutService.js";
import orderService from "../services/orderService.js";
import socketService from "../services/socketService.js";
import OrderPanel from "../components/OrderPanel.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function LayoutView() {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [layout, setLayout] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  useEffect(() => {
    loadData();
    
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
  }, [layoutId, token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [layoutRes, ordersRes] = await Promise.all([
        layoutService.getLayout(layoutId),
        orderService.getOrders({ layoutId }), // Filter by layoutId
      ]);
      setLayout(layoutRes.layout);
      setOrders(ordersRes.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load layout");
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

  const getTableStatus = (tableId) => {
    const tableOrders = orders.filter(
      (order) => order.tableId === tableId && order.status !== "paid"
    );

    if (tableOrders.length === 0) {
      return "available"; // 🟢 Available
    }

    const hasCompleted = tableOrders.some(
      (order) => order.status === "completed"
    );
    if (hasCompleted) {
      return "awaiting-payment"; // 🔴 Awaiting payment
    }

    return "in-progress"; // 🟡 Order in progress
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "border-green-500 bg-green-50 hover:bg-green-100";
      case "in-progress":
        return "border-yellow-500 bg-yellow-50 hover:bg-yellow-100";
      case "awaiting-payment":
        return "border-red-500 bg-red-50 hover:bg-red-100";
      default:
        return "border-gray-300 bg-white hover:bg-gray-50";
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case "available":
        return "🟢";
      case "in-progress":
        return "🟡";
      case "awaiting-payment":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setShowOrderPanel(true);
  };

  const handleCloseOrderPanel = () => {
    setShowOrderPanel(false);
    setSelectedTable(null);
  };

  const handleOrderSuccess = () => {
    loadData(); // Reload orders after creating new order
    handleCloseOrderPanel();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading layout...</div>
        </div>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/staff/home")}
          className="text-blue-600 hover:underline"
        >
          ← Back to layouts
        </button>
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-600">
          {error || "Layout not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate("/staff/home")}
            className="mb-2 text-xs sm:text-sm text-blue-600 hover:underline"
          >
            ← Back to layouts
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{layout.name}</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Click on a table to take an order
          </p>
        </div>
        <button
          onClick={() => navigate(`/staff/orders/${layoutId}`)}
          className="w-full sm:w-auto rounded bg-blue-600 px-4 py-2 text-sm sm:text-base text-white hover:bg-blue-700"
        >
          View Orders
        </button>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-4 rounded-lg border bg-white p-3 sm:p-4 shadow">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">🟢</span>
          <span className="text-xs sm:text-sm whitespace-nowrap">Available</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">🟡</span>
          <span className="text-xs sm:text-sm whitespace-nowrap">Order in Progress</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">🔴</span>
          <span className="text-xs sm:text-sm whitespace-nowrap">Awaiting Payment</span>
        </div>
      </div>

      {/* Layout Canvas */}
      <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-auto rounded-lg border bg-gray-50 shadow-lg touch-pan-x touch-pan-y flex items-center justify-center">
        <div className="relative min-w-full min-h-full">
          {layout.tables && layout.tables.length > 0 ? (
            layout.tables.map((table) => {
              const status = getTableStatus(table.tableId);
              return (
                <div
                  key={table.tableId}
                  onClick={() => handleTableClick(table)}
                  className={`absolute flex h-20 w-20 sm:h-24 sm:w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-4 shadow-lg transition-all active:scale-95 ${getStatusColor(status)}`}
                  style={{
                    left: `${table.x}px`,
                    top: `${table.y}px`,
                  }}
                >
                  <div className="text-xl sm:text-2xl">{getStatusIndicator(status)}</div>
                  <div className="text-base sm:text-lg font-bold">{table.label}</div>
                  <div className="text-xs text-gray-600">
                    {table.seats} seats
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center text-sm sm:text-base text-gray-400">
              No tables in this layout
            </div>
          )}
        </div>
      </div>

      {/* Order Panel Modal */}
      {showOrderPanel && selectedTable && (
        <OrderPanel
          table={selectedTable}
          layoutId={layoutId}
          onClose={handleCloseOrderPanel}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
}
