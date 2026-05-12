import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function StaffLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      await login({ email, password }, "staff");
      navigate("/staff/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Staff Login</h2>
          <p className="mt-2 text-gray-600">
            Sign in with your email and password
          </p>
        </div>

        <div className="rounded-lg border bg-white p-8 shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded border p-2"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded border p-2"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/staff/signup"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:underline"
            >
              ← Back to main login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
