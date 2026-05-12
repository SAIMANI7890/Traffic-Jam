import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import StaffHome from "./pages/StaffHome.jsx";
import LayoutView from "./pages/LayoutView.jsx";
import StaffOrdersView from "./pages/StaffOrdersView.jsx";
import KitchenView from "./pages/KitchenView.jsx";
import ParcelOrder from "./pages/ParcelOrder.jsx";
import LayoutPage from "./pages/LayoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import AdminLayoutsPage from "./pages/AdminLayoutsPage.jsx";
import AdminSettingsPage from "./pages/AdminSettingsPage.jsx";
import Navbar from "./components/Navbar.jsx";

import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl p-2 sm:p-4">
        <Routes>
          {/* Main Login */}
          <Route path="/login" element={<Login />} />

          {/* Staff Routes */}
          <Route
            path="/staff/home"
            element={
              user?.role === "staff" ? (
                <StaffHome />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff/layout/:layoutId"
            element={
              user?.role === "staff" ? (
                <LayoutView />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff/orders/:layoutId"
            element={
              user?.role === "staff" ? (
                <StaffOrdersView />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff/kitchen"
            element={
              user?.role === "staff" ? (
                <KitchenView />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff/parcel"
            element={
              user?.role === "staff" ? (
                <ParcelOrder />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/kitchen"
            element={
              user?.role === "admin" ? (
                <KitchenView />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff"
            element={
              user?.role === "staff" ? (
                <Navigate to="/staff/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/menu"
            element={
              user?.role === "admin" ? (
                <MenuPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/orders"
            element={
              user?.role === "admin" ? (
                <AdminOrdersPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/layouts"
            element={
              user?.role === "admin" ? (
                <AdminLayoutsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/settings"
            element={
              user?.role === "admin" ? (
                <AdminSettingsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Legacy Staff Dashboard (old route) */}
          <Route
            path="/staff-dashboard"
            element={
              user?.role === "staff" ? (
                <StaffDashboard />
              ) : (
                <Navigate to="/staff/login" replace />
              )
            }
          />

          {/* Shared Routes */}
          <Route
            path="/layout"
            element={user ? <LayoutPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders"
            element={user ? <OrdersPage /> : <Navigate to="/login" replace />}
          />

          {/* Root Route */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  user?.role === "admin"
                    ? "/admin"
                    : user?.role === "staff"
                    ? "/staff/home"
                    : "/login"
                }
                replace
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
