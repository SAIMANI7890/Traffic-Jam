import { useEffect, useState } from "react";
import menuService from "../services/menuService.js";
import orderService from "../services/orderService.js";

export default function OrderPanel({ table, layoutId, onClose, onSuccess }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSelectedExpanded, setIsSelectedExpanded] = useState(false);

  useEffect(() => {
    loadMenu();
    
    // Prevent background scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup: restore scroll when modal closes
    return () => {
      document.body.style.overflow = 'unset';
    };
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
              // Handle both string and object category
              if (typeof item.category === 'string') {
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
    
    // Handle both string and object category
    const itemCategory = typeof item.category === 'string' 
      ? item.category 
      : item.category?.name || '';
    
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
      // Increase quantity
      const updated = [...selectedItems];
      updated[existingIndex].qty += 1;
      setSelectedItems(updated);
    } else {
      // Add new item
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

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      setError("Please add at least one item");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await orderService.createOrder({
        items: selectedItems,
        tableId: table.label,
        layoutId: layoutId, // Include layoutId
        notes: notes.trim(),
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="flex h-[95vh] sm:h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 p-2 sm:p-4">
          <h2 className="text-base sm:text-2xl font-bold truncate">
            Order for {table.label} <span className="text-xs sm:text-base text-gray-600">({table.seats} seats)</span>
          </h2>
          <button
            onClick={onClose}
            className="text-2xl sm:text-3xl text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Category Section - Dropdown on mobile, Sidebar on desktop */}
          <div className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r bg-gray-50 lg:overflow-y-auto ${isSelectedExpanded ? 'hidden lg:block' : ''}`}>
            {/* Mobile: Dropdown */}
            <div className="block lg:hidden p-1.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-[10px] font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop: Sidebar */}
            <div className="hidden lg:block p-4">
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-4 py-2 rounded mb-1 ${
                  selectedCategory === ""
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded mb-1 ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Section (Full width on mobile, Center on desktop) */}
          <div className={`flex-col flex-1 lg:w-2/5 min-h-0 ${isSelectedExpanded ? 'hidden lg:flex' : 'flex'}`}>
            <div className="border-b bg-white p-2 sm:p-4">
              <h3 className="mb-1.5 sm:mb-3 text-xs sm:text-xl font-bold">Menu</h3>
              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full rounded border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Menu Items List - Fixed height for 3 rows on mobile */}
            <div className="overflow-y-auto bg-gray-50 p-1.5 sm:p-4 h-[240px] lg:flex-1 lg:h-auto">
              {loading ? (
                <div className="text-center text-[10px] sm:text-sm text-gray-500">Loading menu...</div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-center text-[10px] sm:text-sm text-gray-500">No items found</div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-3">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleAddItem(item)}
                      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-1 sm:p-4 transition-all hover:border-blue-500 hover:shadow-lg active:scale-95"
                    >
                      <div className="flex items-center justify-between gap-1 sm:gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] sm:text-lg font-semibold text-gray-900 truncate leading-tight">{item.name}</h4>
                          <span className="inline-block text-[8px] sm:text-xs text-gray-500 uppercase leading-tight">
                            {typeof item.category === 'string' 
                              ? item.category 
                              : item.category?.name || 'Uncategorized'}
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xl font-bold text-blue-600 whitespace-nowrap flex-shrink-0">
                          ₹{item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Items Section (Bottom on mobile, Right on desktop) */}
          <div className={`flex flex-col flex-1 border-t lg:border-t-0 lg:border-l bg-white ${isSelectedExpanded ? 'min-h-0 max-h-none' : 'min-h-[45vh] lg:min-h-0 max-h-[50vh] lg:max-h-none'}`}>
            <div className="border-b p-2 sm:p-4 bg-blue-50 lg:bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-lg font-semibold text-blue-900 lg:text-gray-900">
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
                    className={`w-5 h-5 transition-transform ${isSelectedExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 sm:p-4 bg-blue-50 lg:bg-white">
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
                <div className="space-y-1.5 sm:space-y-3">
                  {selectedItems.map((item, index) => (
                    <div
                      key={`selected-${item.menuItem}-${index}`}
                      className="rounded-lg border-2 border-blue-200 bg-white p-1.5 sm:p-3 shadow-sm"
                    >
                      <div className="mb-1.5 sm:mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-base font-semibold text-gray-900 truncate">{item.name}</div>
                          <div className="text-[10px] sm:text-sm text-gray-500">
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
                            onClick={() =>
                              handleUpdateQuantity(index, item.qty - 1)
                            }
                            className="rounded bg-blue-100 hover:bg-blue-200 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold text-blue-700 active:scale-95"
                          >
                            −
                          </button>
                          <span className="w-5 sm:w-8 text-center text-xs sm:text-base font-bold text-blue-700">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(index, item.qty + 1)
                            }
                            className="rounded bg-blue-100 hover:bg-blue-200 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold text-blue-700 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-xs sm:text-base font-bold text-blue-700">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="border-t p-2 sm:p-4">
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special requests..."
                className="w-full rounded border border-gray-300 p-1.5 sm:p-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* Total and Place Order */}
            <div className="border-t bg-gray-50 p-2 sm:p-4">
              <div className="mb-2 sm:mb-3 flex items-center justify-between text-base sm:text-xl font-bold">
                <span>Total:</span>
                <span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span>
              </div>

              {error && (
                <div className="mb-2 sm:mb-3 rounded border border-red-300 bg-red-50 p-1.5 sm:p-2 text-[10px] sm:text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || selectedItems.length === 0}
                className="w-full rounded-lg bg-green-600 px-4 py-2 sm:py-3 text-xs sm:text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors active:scale-95"
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
