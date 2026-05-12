import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return config;
    const parsed = JSON.parse(raw);
    if (parsed?.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor - Handle errors but DON'T auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging but don't clear auth
    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized - Token may be expired or invalid");
      // Note: We don't automatically logout here
      // User will stay logged in until they manually logout
      // or token expires (7 days)
    }
    return Promise.reject(error);
  }
);

export default api;
