export default function TableGrid({ tables, onTableClick }) {
  if (!tables || tables.length === 0) {
    return (
      <div className="rounded border bg-white p-8 text-center text-gray-500">
        No tables in this layout
      </div>
    );
  }

  return (
    <div className="relative h-[500px] overflow-hidden rounded border bg-gray-50 shadow">
      {tables.map((table) => (
        <button
          key={table.tableId}
          onClick={() => onTableClick && onTableClick(table)}
          className="absolute flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-blue-500 bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{
            left: `${table.x}px`,
            top: `${table.y}px`,
          }}
        >
          <div className="text-sm font-bold">{table.label}</div>
          <div className="text-xs text-gray-500">{table.seats} seats</div>
        </button>
      ))}
    </div>
  );
}
