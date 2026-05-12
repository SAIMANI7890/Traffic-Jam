import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Layout Management",
      description: "Create and manage restaurant table layouts",
      icon: "🪑",
      path: "/admin/layouts",
      color: "bg-blue-500",
    },
    {
      title: "Orders",
      description: "Monitor all orders in real-time",
      icon: "📦",
      path: "/admin/orders",
      color: "bg-green-500",
    },
    {
      title: "Menu Management",
      description: "Manage menu items and categories",
      icon: "🍽",
      path: "/admin/menu",
      color: "bg-purple-500",
    },
    {
      title: "Kitchen View",
      description: "Monitor kitchen order preparation status",
      icon: "👨‍🍳",
      path: "/admin/kitchen",
      color: "bg-orange-500",
    },
    {
      title: "Settings",
      description: "Change PIN and manage account",
      icon: "⚙️",
      path: "/admin/settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Manage your restaurant operations from here
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 sm:p-6 text-left shadow-sm transition-all hover:shadow-lg active:scale-95"
          >
            <div
              className={`absolute right-0 top-0 h-20 w-20 sm:h-24 sm:w-24 translate-x-8 -translate-y-8 rounded-full ${card.color} opacity-10 transition-transform group-hover:scale-150`}
            />
            <div className="relative">
              <div className="mb-3 sm:mb-4 text-3xl sm:text-4xl">{card.icon}</div>
              <h2 className="mb-1 sm:mb-2 text-lg sm:text-xl font-semibold text-gray-900">
                {card.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
