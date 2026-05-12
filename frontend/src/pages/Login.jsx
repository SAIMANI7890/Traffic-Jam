import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: Choose role
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' or 'staff'
  
  // Step 2: Choose action (for admin only)
  const [selectedAction, setSelectedAction] = useState(null); // 'login' or 'signup'

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSelectedAction(null);
    setError("");
    // Reset form
    setUsername("");
    setEmail("");
    setPin("");
    setConfirmPin("");
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let credentials = {};

      if (selectedRole === "admin") {
        if (selectedAction === "signup") {
          // Admin Signup
          if (pin !== confirmPin) {
            setError("PIN and Confirm PIN do not match");
            setLoading(false);
            return;
          }
          credentials = { username, email, pin, confirmPin, action: "signup" };
        } else {
          // Admin Login
          credentials = { email, pin, action: "login" };
        }
      } else {
        // Staff Login
        credentials = { username, pin, action: "staffLogin" };
      }

      const result = await login(credentials);
      const role = result?.user?.role;
      navigate(role === "admin" ? "/admin" : "/staff", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedAction) {
      setSelectedAction(null);
    } else {
      setSelectedRole(null);
    }
    setError("");
  };

  // Step 1: Role Selection
  if (!selectedRole) {
    return (
      <div className="mx-auto max-w-md px-4">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold">Welcome to ServeSync</h1>
          <p className="text-sm sm:text-base text-gray-600">Select your role to continue</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => handleRoleSelect("admin")}
            className="group w-full rounded-lg border-2 border-blue-500 bg-white p-4 sm:p-6 text-left transition-all hover:bg-blue-50 active:scale-95"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl sm:text-3xl">
                👨‍💼
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Login as Admin
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Manage your restaurant operations
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("staff")}
            className="group w-full rounded-lg border-2 border-green-500 bg-white p-4 sm:p-6 text-left transition-all hover:bg-green-50 active:scale-95"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl sm:text-3xl">
                👨‍🍳
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Login as Staff
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Access your work dashboard
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Admin - Choose Login or Signup
  if (selectedRole === "admin" && !selectedAction) {
    return (
      <div className="mx-auto max-w-md px-4">
        <button
          onClick={handleBack}
          className="mb-4 text-xs sm:text-sm text-blue-600 hover:underline"
        >
          ← Back to role selection
        </button>

        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="mb-2 text-xl sm:text-2xl font-bold">Admin Access</h1>
          <p className="text-sm sm:text-base text-gray-600">Choose an option</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => handleActionSelect("login")}
            className="w-full rounded-lg border bg-white p-3 sm:p-4 text-left hover:bg-gray-50 active:scale-95"
          >
            <h3 className="text-base sm:text-lg font-semibold">Login</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account? Sign in here
            </p>
          </button>

          <button
            onClick={() => handleActionSelect("signup")}
            className="w-full rounded-lg border bg-white p-3 sm:p-4 text-left hover:bg-gray-50 active:scale-95"
          >
            <h3 className="text-base sm:text-lg font-semibold">Signup</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Create a new admin account
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Show appropriate form
  return (
    <div className="mx-auto max-w-md px-4">
      <button
        onClick={handleBack}
        className="mb-4 text-xs sm:text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <div className="mb-4 sm:mb-6">
        <h1 className="mb-2 text-xl sm:text-2xl font-bold">
          {selectedRole === "admin"
            ? selectedAction === "signup"
              ? "Admin Signup"
              : "Admin Login"
            : "Staff Login"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {selectedRole === "admin"
            ? selectedAction === "signup"
              ? "Create your admin account"
              : "Sign in to your admin account"
            : "Sign in with your username and admin's PIN"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 sm:space-y-4 rounded-lg border bg-white p-4 sm:p-6 shadow"
      >
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-2 sm:p-3 text-xs sm:text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Admin Signup Form */}
        {selectedRole === "admin" && selectedAction === "signup" && (
          <>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded border p-2 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border p-2 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                PIN (4 digits) *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded border p-2 text-sm sm:text-base"
                placeholder="1234"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This PIN will be shared with your staff for login
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Confirm PIN *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, ""))
                }
                className="w-full rounded border p-2 text-sm sm:text-base"
                placeholder="1234"
                required
              />
            </div>
          </>
        )}

        {/* Admin Login Form */}
        {selectedRole === "admin" && selectedAction === "login" && (
          <>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border p-2 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">PIN *</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded border p-2 text-sm sm:text-base"
                placeholder="1234"
                required
              />
            </div>
          </>
        )}

        {/* Staff Login Form */}
        {selectedRole === "staff" && (
          <>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded border p-2 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                PIN (from Admin) *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded border p-2 text-sm sm:text-base"
                placeholder="1234"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Use the PIN shared by your admin
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2.5 sm:p-3 text-sm sm:text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 active:scale-95"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : selectedRole === "admin" && selectedAction === "signup"
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>
    </div>
  );
}
