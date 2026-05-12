import { useEffect, useState, useRef } from "react";
import layoutService from "../services/layoutService.js";

export default function AdminLayoutsPage() {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingLayout, setEditingLayout] = useState(null);
  const [layoutName, setLayoutName] = useState("");
  const [tables, setTables] = useState([]);
  const [editMode, setEditMode] = useState(true);
  const [nextTableNum, setNextTableNum] = useState(1);
  const [draggingTable, setDraggingTable] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      const res = await layoutService.getLayouts();
      setLayouts(res.layouts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load layouts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingLayout(null);
    setLayoutName("");
    setTables([]);
    setNextTableNum(1);
    setEditMode(true);
    setShowEditor(true);
  };

  const handleEdit = (layout) => {
    setEditingLayout(layout);
    setLayoutName(layout.name);
    setTables(layout.tables || []);
    setNextTableNum(
      Math.max(...(layout.tables || []).map((t) => parseInt(t.label.slice(1)) || 0), 0) + 1,
    );
    setEditMode(true);
    setShowEditor(true);
  };

  const handleAddTable = () => {
    const newTable = {
      tableId: `table-${Date.now()}`,
      label: `T${nextTableNum}`,
      x: 50,
      y: 50,
      seats: 4,
    };
    setTables([...tables, newTable]);
    setNextTableNum(nextTableNum + 1);
  };

  const handleTableDrag = (tableId, data) => {
    setTables((prev) =>
      prev.map((table) =>
        table.tableId === tableId
          ? { ...table, x: data.x, y: data.y }
          : table,
      ),
    );
  };

  const handleMouseDown = (e, tableId) => {
    if (!editMode) return;
    e.preventDefault();
    
    const table = tables.find(t => t.tableId === tableId);
    if (!table) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTableX = table.x;
    const startTableY = table.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newX = Math.max(0, Math.min(startTableX + deltaX, rect.width - 80));
      const newY = Math.max(0, Math.min(startTableY + deltaY, rect.height - 80));

      setTables((prev) =>
        prev.map((t) =>
          t.tableId === tableId ? { ...t, x: newX, y: newY } : t
        )
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setDraggingTable(null);
    };

    setDraggingTable(tableId);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRemoveTable = (tableId) => {
    setTables((prev) => prev.filter((table) => table.tableId !== tableId));
  };

  const handleSave = async () => {
    if (!layoutName.trim()) {
      setError("Layout name is required");
      return;
    }

    if (tables.length === 0) {
      setError("Add at least one table");
      return;
    }

    try {
      setError("");
      const layoutData = {
        name: layoutName,
        tables,
        isActive: true,
      };

      if (editingLayout) {
        await layoutService.updateLayout(editingLayout._id, layoutData);
      } else {
        await layoutService.createLayout(layoutData);
      }

      await loadLayouts();
      setShowEditor(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save layout");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this layout?")) return;

    try {
      await layoutService.deleteLayout(id);
      await loadLayouts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete layout");
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {editingLayout ? "Edit Layout" : "Create New Layout"}
          </h1>
          <button
            onClick={() => setShowEditor(false)}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4 rounded border bg-white p-6 shadow">
          <div>
            <label className="block text-sm font-medium">Layout Name *</label>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="e.g., Main Floor, Patio"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleAddTable}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              + Add Table
            </button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
              />
              <span className="text-sm">Edit Mode (Drag & Drop)</span>
            </label>
            <div className="text-sm text-gray-600">
              Tables: {tables.length}
            </div>
          </div>
        </div>

        <div 
          ref={canvasRef}
          className="relative h-[600px] overflow-hidden rounded border bg-gray-50 shadow"
        >
          {tables.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              Click "Add Table" to start creating your layout
            </div>
          ) : (
            tables.map((table) => (
              <div
                key={table.tableId}
                onMouseDown={(e) => handleMouseDown(e, table.tableId)}
                className={`absolute flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-blue-500 bg-white shadow-lg ${
                  editMode ? 'cursor-move' : 'cursor-default'
                } ${draggingTable === table.tableId ? 'opacity-70' : ''}`}
                style={{
                  left: `${table.x}px`,
                  top: `${table.y}px`,
                  touchAction: "none",
                  userSelect: "none"
                }}
              >
                <div className="text-sm font-bold">{table.label}</div>
                <div className="text-xs text-gray-500">
                  {table.seats} seats
                </div>
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTable(table.tableId);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700"
          >
            Save Layout
          </button>
          <button
            onClick={() => setShowEditor(false)}
            className="rounded border px-6 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Layout Management</h1>
        <button
          onClick={handleCreateNew}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create New Layout
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {layouts.length === 0 ? (
          <div className="col-span-full rounded border bg-white p-8 text-center text-gray-500 shadow">
            No layouts found. Create your first layout!
          </div>
        ) : (
          layouts.map((layout) => (
            <div
              key={layout._id}
              className="rounded border bg-white p-6 shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{layout.name}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {layout.tables?.length || 0} tables
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    layout.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {layout.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="relative h-32 overflow-hidden rounded border bg-gray-50">
                {layout.tables && layout.tables.length > 0 ? (
                  layout.tables.map((table) => (
                    <div
                      key={table.tableId}
                      className="absolute flex h-8 w-8 items-center justify-center rounded border bg-blue-500 text-xs text-white"
                      style={{
                        left: `${Math.min(Math.max((table.x / 800) * 100, 0), 90)}%`,
                        top: `${Math.min(Math.max((table.y / 600) * 100, 0), 75)}%`,
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

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(layout)}
                  className="flex-1 rounded border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(layout._id)}
                  className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
