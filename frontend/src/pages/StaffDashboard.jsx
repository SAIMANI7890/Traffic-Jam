import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import layoutService from "../services/layoutService.js";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      const res = await layoutService.getLayouts({ isActive: true });
      setLayouts(res.layouts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load layouts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Select a layout to start taking orders
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {layouts.length === 0 ? (
          <div className="col-span-full rounded border bg-white p-8 text-center text-gray-500 shadow">
            No active layouts available. Please contact admin.
          </div>
        ) : (
          layouts.map((layout) => (
            <button
              key={layout._id}
              onClick={() => navigate(`/staff/layout/${layout._id}`)}
              className="group rounded border bg-white p-6 text-left shadow transition-all hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {layout.name}
              </h2>
              <div className="text-sm text-gray-600">
                {layout.tables?.length || 0} tables
              </div>
              <div className="relative mt-4 h-24 overflow-hidden rounded border bg-gray-50">
                {layout.tables?.map((table) => (
                  <div
                    key={table.tableId}
                    className="absolute flex h-6 w-6 items-center justify-center rounded border bg-blue-500 text-xs text-white"
                    style={{
                      left: `${(table.x / 800) * 100}%`,
                      top: `${(table.y / 600) * 100}%`,
                    }}
                  >
                    {table.label}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline">
                Open Layout →
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
