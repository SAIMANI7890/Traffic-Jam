export default function OrderCard({ order, onStatusChange }) {
  // Add safety check
  if (!order) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
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
      case "cancelled":
        return "CANCELLED";
      default:
        return status;
    }
  };

  const calculateTotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
  };

  return (
    <div className="rounded border bg-white p-4 shadow">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold">Table: {order.tableId || 'N/A'}</h3>
          <div className="text-xs text-gray-500">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
          </div>
        </div>
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="mb-3 space-y-1">
        {order.items && Array.isArray(order.items) && order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span>
              {item.name || 'Unknown'} × {item.qty || 0}
            </span>
            <span>${((item.price || 0) * (item.qty || 0)).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {onStatusChange && (
        <div className="mt-3 flex gap-2">
          {order.status === "open" && (
            <button
              onClick={() => onStatusChange(order._id, "in_progress")}
              className="flex-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Start Preparing
            </button>
          )}
          {order.status === "in_progress" && (
            <button
              onClick={() => onStatusChange(order._id, "completed")}
              className="flex-1 rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
            >
              Mark Served
            </button>
          )}
        </div>
      )}
    </div>
  );
}
