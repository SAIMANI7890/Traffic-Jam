import api from "./api.js";

const STORAGE_KEY = "auth";

const authService = {
  getStoredAuth() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async verifyToken() {
    try {
      const stored = this.getStoredAuth();
      if (!stored?.token) {
        return { valid: false, user: null };
      }

      // Call backend to verify token
      const { data } = await api.get("/api/auth/verify");
      return { valid: true, user: data.user };
    } catch (error) {
      // Token is invalid or expired
      console.warn("[authService] Token verification failed:", error.response?.status);
      // Clear invalid token
      this.logout();
      return { valid: false, user: null };
    }
  },

  async login(credentials, userType = "admin") {
    const { action, ...rest } = credentials;
    let endpoint = "";
    let payload = {};

    // Staff login with email/password
    if (userType === "staff" && rest.email && rest.password) {
      endpoint = "/api/auth/staff/login";
      payload = {
        email: rest.email,
        password: rest.password,
      };
    }
    // Admin signup
    else if (action === "signup") {
      endpoint = "/api/auth/admin/signup";
      payload = {
        username: rest.username,
        email: rest.email,
        pin: rest.pin,
        confirmPin: rest.confirmPin,
      };
    }
    // Admin login
    else if (action === "login") {
      endpoint = "/api/auth/admin/login";
      payload = {
        email: rest.email,
        pin: rest.pin,
      };
    }
    // Staff login with username/PIN
    else if (action === "staffLogin") {
      endpoint = "/api/auth/staff/login";
      payload = {
        username: rest.username,
        pin: rest.pin,
      };
    }

    const { data } = await api.post(endpoint, payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  },

  logout() {
    // Only called when user explicitly clicks logout button
    // Session persists for 7 days otherwise
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default authService;
