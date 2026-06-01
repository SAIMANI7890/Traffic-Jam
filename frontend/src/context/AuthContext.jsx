import { createContext, useEffect, useMemo, useState } from "react";

import authService from "../services/authService.js";
import logger from "../utils/logger.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    // Verify token on app load
    const verifyStoredToken = async () => {
      const stored = authService.getStoredAuth();
      
      if (!stored?.token) {
        // No token stored, user is not logged in
        logger.log("[AuthContext] No stored token found");
        setAuthState({
          user: null,
          token: null,
          loading: false,
        });
        return;
      }

      logger.log("[AuthContext] Found stored token, verifying...");
      
      // Verify token with backend
      const { valid, user } = await authService.verifyToken();
      
      if (valid && user) {
        logger.log("[AuthContext] Token is valid, user authenticated:", {
          userRole: user.role,
          username: user.username,
        });
        setAuthState({
          user,
          token: stored.token,
          loading: false,
        });
      } else {
        logger.log("[AuthContext] Token is invalid or expired, clearing session");
        setAuthState({
          user: null,
          token: null,
          loading: false,
        });
      }
    };

    verifyStoredToken();
  }, []);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      loading: authState.loading,
      login: async (credentials, userType) => {
        const result = await authService.login(credentials, userType);
        logger.log("[AuthContext] Login successful:", {
          userRole: result.user?.role,
          username: result.user?.username,
          hasToken: !!result.token,
        });
        setAuthState({
          user: result.user,
          token: result.token,
          loading: false,
        });
        return result;
      },
      logout: () => {
        logger.log("[AuthContext] Logging out");
        authService.logout();
        setAuthState({
          user: null,
          token: null,
          loading: false,
        });
      },
    }),
    [authState],
  );

  // Show loading state while checking authentication
  if (authState.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
