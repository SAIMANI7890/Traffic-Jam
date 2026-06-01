import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import layoutService from "../services/layoutService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function StaffHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      const response = await layoutService.getLayouts();
      setLayouts(response.layouts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load layouts");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLayout = (layoutId) => {
    navigate(`/staff/layout/${layoutId}`);
  };

  const handleGoToKitchen = () => {
    navigate("/staff/kitchen");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading layouts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {user?.username}!</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Select a layout to start taking orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/staff/parcel-orders")}
            className="w-full sm:w-auto rounded bg-purple-600 px-4 sm:px-6 py-2 font-medium text-white hover:bg-purple-700"
          >
            📋 Parcel Orders
          </button>
          <button
            onClick={handleGoToKitchen}
            className="w-full sm:w-auto rounded bg-blue-600 px-4 sm:px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            👨‍🍳 Kitchen
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {layouts.length === 0 ? (
          <div className="col-span-full rounded-lg border bg-white p-8 sm:p-12 text-center shadow">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12 sm:h-16 sm:w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                />
              </svg>
              <p className="mt-4 text-base sm:text-lg font-medium text-gray-600">
                No layouts available
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Contact your admin to create restaurant layouts
              </p>
            </div>
          </div>
        ) : (
          layouts.map((layout) => (
            <div
              key={layout._id}
              onClick={() => handleSelectLayout(layout._id)}
              className="cursor-pointer rounded-lg border bg-white p-4 sm:p-6 shadow transition-all hover:shadow-lg hover:border-blue-500 active:scale-95"
            >
              <div className="mb-3 sm:mb-4 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold truncate">{layout.name}</h3>
                  <div className="mt-1 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{layout.tables?.length || 0} tables</span>
                  </div>
                </div>
                {layout.isActive && (
                  <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 whitespace-nowrap ml-2">
                    Active
                  </span>
                )}
              </div>

              {/* Layout Preview */}
              <div className="relative h-32 sm:h-40 overflow-hidden rounded border bg-gray-50">
                {layout.tables && layout.tables.length > 0 ? (
                  layout.tables.map((table) => (
                    <div
                      key={table.tableId}
                      className="absolute flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded border-2 border-blue-500 bg-white text-xs font-bold shadow"
                      style={{
                        left: `${Math.min(Math.max((table.x / 800) * 100, 0), 85)}%`,
                        top: `${Math.min(Math.max((table.y / 600) * 100, 0), 70)}%`,
                      }}
                    >
                      {table.label}
                    </div>
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No tables
                  </div>
                )}
              </div>

              <div className="mt-3 sm:mt-4 flex items-center justify-center">
                <button className="w-full sm:w-auto rounded bg-blue-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700">
                  Select Layout →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
