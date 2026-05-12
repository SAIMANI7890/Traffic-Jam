import { createContext, useEffect, useMemo, useState } from "react";

import authService from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    // Load auth data from localStorage
    const stored = authService.getStoredAuth();
    
    console.log("[AuthContext] Loading auth from localStorage:", {
      hasToken: !!stored?.token,
      hasUser: !!stored?.user,
      userRole: stored?.user?.role,
      username: stored?.user?.username,
    });
    
    // Update all state at once to avoid race conditions
    setAuthState({
      user: stored?.user || null,
      token: stored?.token || null,
      loading: false,
    });
  }, []);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      loading: authState.loading,
      login: async (credentials, userType) => {
        const result = await authService.login(credentials, userType);
        console.log("[AuthContext] Login successful:", {
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
        console.log("[AuthContext] Logging out");
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
