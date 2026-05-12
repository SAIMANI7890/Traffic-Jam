import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import menuService from "../services/menuService.js";
import orderService from "../services/orderService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function ParcelOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSelectedExpanded, setIsSelectedExpanded] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenuItems();
      const items = response.items || [];
      setMenuItems(items);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(
          items
            .map((item) => {
              if (typeof item.category === "string") {
                return item.category;
              } else if (item.category && item.category.name) {
                return item.category.name;
              }
              return null;
            })
            .filter(Boolean)
        ),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const itemCategory =
      typeof item.category === "string"
        ? item.category
        : item.category?.name || "";

    const matchesCategory = selectedCategory
      ? itemCategory === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (menuItem) => {
    const existingIndex = selectedItems.findIndex(
      (item) => item.menuItem === menuItem._id
    );

    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].qty += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          qty: 1,
        },
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, newQty) => {
    if (newQty < 1) {
      handleRemoveItem(index);
      return;
    }

    const updated = [...selectedItems];
    updated[index].qty = newQty;
    setSelectedItems(updated);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const handlePlaceParcel = async () => {
    if (selectedItems.length === 0) {
      setError("Please add at least one item");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await orderService.createOrder({
        items: selectedItems,
        tableId: "PARCEL",
        layoutId: null,
        notes: notes.trim(),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        isParcel: true,
      });

      // Reset form
      setSelectedItems([]);
      setNotes("");
      setCustomerName("");
      setCustomerPhone("");
      setSearchQuery("");
      setSelectedCategory("");
      
      alert("Parcel order placed successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place parcel order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">📦 Parcel Order</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Create takeaway/parcel orders
          </p>
        </div>
        <button
          onClick={() => navigate("/staff/home")}
          className="w-full sm:w-auto rounded bg-gray-600 px-4 py-2 text-sm sm:text-base text-white hover:bg-gray-700"
        >
          ← Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Side - Menu */}
        <div className={`flex-1 bg-white rounded-lg shadow-lg border ${isSelectedExpanded ? 'hidden lg:block' : ''}`}>
          {/* Category Section */}
          <div className="border-b p-3 sm:p-4">
            <h3 className="mb-2 text-sm sm:text-lg font-semibold">Categories</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs sm:text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="border-b p-3 sm:p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Menu Items */}
          <div className="p-3 sm:p-4 h-[300px] sm:h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center text-sm text-gray-500">Loading menu...</div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center text-sm text-gray-500">No items found</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleAddItem(item)}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 sm:p-3 transition-all hover:border-blue-500 hover:shadow-lg active:scale-95"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate leading-tight">
                          {item.name}
                        </h4>
                        <span className="inline-block text-[9px] sm:text-xs text-gray-500 uppercase leading-tight">
                          {typeof item.category === "string"
                            ? item.category
                            : item.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-blue-600 whitespace-nowrap flex-shrink-0">
                        ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Selected Items & Customer Info */}
        <div className={`lg:w-[400px] bg-white rounded-lg shadow-lg border flex flex-col ${isSelectedExpanded ? 'flex-1' : ''}`}>
          {/* Selected Items Header */}
          <div className="border-b p-3 sm:p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-lg font-semibold text-blue-900">
                Selected Items
                {selectedItems.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                    {selectedItems.length}
                  </span>
                )}
              </h3>
              {/* Expand/Collapse Button - Only on mobile */}
              <button
                onClick={() => setIsSelectedExpanded(!isSelectedExpanded)}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all"
                aria-label={isSelectedExpanded ? "Collapse" : "Expand"}
              >
                <svg
                  className={`w-5 h-5 transition-transform ${isSelectedExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Selected Items List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-blue-50 min-h-[200px]">
            {selectedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">
                  No items selected
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tap items from menu to add
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {selectedItems.map((item, index) => (
                  <div
                    key={`selected-${item.menuItem}-${index}`}
                    className="rounded-lg border-2 border-blue-200 bg-white p-2 sm:p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500">
                          ₹{item.price.toFixed(2)} each
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-lg sm:text-xl text-red-500 hover:text-red-700 flex-shrink-0 font-bold"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(index, item.qty - 1)}
                          className="rounded bg-blue-100 hover:bg-blue-200 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold text-blue-700 active:scale-95"
                        >
                          −
                        </button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold text-blue-700">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, item.qty + 1)}
                          className="rounded bg-blue-100 hover:bg-blue-200 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold text-blue-700 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-blue-700">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="border-t p-3 sm:p-4 bg-white">
            <h4 className="text-xs sm:text-sm font-semibold mb-2">Customer Details (Optional)</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full rounded border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="border-t p-3 sm:p-4 bg-white">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests..."
              className="w-full rounded border border-gray-300 p-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Total and Place Order */}
          <div className="border-t bg-gray-50 p-3 sm:p-4">
            <div className="mb-2 sm:mb-3 flex items-center justify-between text-base sm:text-xl font-bold">
              <span>Total:</span>
              <span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span>
            </div>

            {error && (
              <div className="mb-2 sm:mb-3 rounded border border-red-300 bg-red-50 p-2 text-xs sm:text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceParcel}
              disabled={submitting || selectedItems.length === 0}
              className="w-full rounded-lg bg-green-600 px-4 py-2 sm:py-3 text-xs sm:text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors active:scale-95"
            >
              {submitting ? "Placing Order..." : "📦 Place Parcel Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
