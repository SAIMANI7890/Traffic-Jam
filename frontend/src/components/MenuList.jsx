import { useEffect, useState } from "react";
import menuService from "../services/menuService.js";

export default function MenuList({ onSelectItem }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        menuService.getMenuItems(),
        menuService.getCategories(),
      ]);
      setItems(itemsRes.items || []);
      setCategories(categoriesRes.categories || []);
    } catch (err) {
      console.error("Failed to load menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || item.category?._id === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  if (loading) {
    return <div className="text-center text-sm text-gray-600">Loading menu...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded border p-2 text-sm"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center text-sm text-gray-500">No items found</div>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item._id}
              onClick={() => onSelectItem && onSelectItem(item)}
              className="w-full rounded border bg-white p-3 text-left hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </div>
                <div className="font-medium">${item.price.toFixed(2)}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
