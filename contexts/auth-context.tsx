"use client";

/**
 * Auth context: provides user, login state, and logout to the whole app.
 * On mount, restores session from localStorage (for fast UI) then validates via /api/auth/session.
 * Clearing auth also clears dashboard/portal query caches so the next user does not see stale data.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { getSessionClient } from "@/utils/auth.client";
import { queryKeys } from "@/lib/react-query";
import type { User, AuthContextType } from "@/types";

/** Context holding auth state and methods; consumed via useAuth(). */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Wraps the app in layout; children get access to useAuth() for user, isLoggedIn, logout, checkSession.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  // Initialize with false to prevent hydration mismatch
  // Will be updated from localStorage after mount
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mounted, setMounted] = useState(false);

  /**
   * Clear all authentication data from state and storage
   */
  const clearAuthData = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    Cookies.remove("session_id");
    // Clear attributes from local storage
    localStorage.setItem("isAuth", "false");
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("token", "");
    localStorage.setItem("getSession", "");
    // Remove dashboard and portal caches so next user doesn't see previous user's data
    queryClient.removeQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.removeQueries({ queryKey: queryKeys.portal.all });
  }, [queryClient]);

  useEffect(() => {
    // Mark component as mounted
    queueMicrotask(() => setMounted(true));

    // Load cached auth state from localStorage after mount to prevent hydration errors
    const cachedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const cachedSession = localStorage.getItem("getSession");

    if (cachedIsLoggedIn && cachedSession) {
      try {
        const parsed = JSON.parse(cachedSession);
        setUser({
          id: parsed.userId || parsed.id,
          name: parsed.userName || parsed.name,
          email: parsed.userEmail || parsed.email,
          image: parsed.image || parsed.picture || null, // Support both image and picture (backward compatibility)
          role: parsed.userRole ?? parsed.role ?? "user",
        });
        setIsLoggedIn(true);
      } catch (error) {
        // Invalid cached data, will check session from server
      }
    }
  }, []);

  /**
   * Check if user has an active session
   * Can be called to force a session refresh
   * Memoized with useCallback to prevent unnecessary recreations
   */
  const checkSession = useCallback(async () => {
    try {
      setIsCheckingAuth(true);
      // Delay to ensure cookie is available after OAuth redirect
      // Increased delay to account for browser cookie propagation
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Note: session_id cookie is httpOnly, so Cookies.get() won't work
      // We need to check session via API which will include the cookie automatically
      const session = await getSessionClient();
      if (session) {
        setIsLoggedIn(true);
        setUser({
          id: session.id,
          name: session.name,
          email: session.email,
          image:
            session.image ||
            (session as { picture?: string }).picture ||
            undefined, // Support both image and picture (backward compatibility)
          role: (session as { role?: string }).role ?? "user",
        });
        // Set necessary attributes in local storage
        localStorage.setItem("isAuth", "true");
        localStorage.setItem("isLoggedIn", "true");
        // Store session ID from localStorage if available, otherwise use session.id as token
        const existingToken = localStorage.getItem("token") || session.id;
        localStorage.setItem("token", existingToken);
        localStorage.setItem("getSession", JSON.stringify(session));
      } else {
        clearAuthData();
      }
    } finally {
      setIsCheckingAuth(false);
    }
  }, []); // Empty dependency array - function is stable

  /**
   * Force refresh session (useful after OAuth redirect)
   */
  const refreshSession = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  useEffect(() => {
    // Only run after component is mounted
    if (!mounted) return;

    // Initialize local storage with default values if not already set
    if (localStorage.getItem("isAuth") === null) {
      localStorage.setItem("isAuth", "false");
    }
    if (localStorage.getItem("isLoggedIn") === null) {
      localStorage.setItem("isLoggedIn", "false");
    }
    if (localStorage.getItem("token") === null) {
      localStorage.setItem("token", "");
    }
    if (localStorage.getItem("getSession") === null) {
      localStorage.setItem("getSession", "");
    }
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", "light");
    }
    if (localStorage.getItem("jiraBaseUrl") === null) {
      localStorage.setItem("jiraBaseUrl", "atlassian.net");
    }
    if (localStorage.getItem("captureCloudUrl") === null) {
      localStorage.setItem(
        "captureCloudUrl",
        "https://prod-capture.zephyr4jiracloud.com/capture",
      );
    }

    // Check if we're coming from OAuth redirect (URL has oauth_success=true)
    // If so, skip initial session check - it will be handled by the homepage's refreshSession
    // Use a more reliable check that works during SSR and client-side
    const isOAuthRedirect =
      typeof window !== "undefined" &&
      (window.location.search.includes("oauth_success=true") ||
        window.location.href.includes("oauth_success=true"));

    // Initial session check - skip if OAuth redirect (will be handled by refreshSession)
    if (!isOAuthRedirect) {
      checkSession();
    } else {
      // For OAuth redirect, set isCheckingAuth to false immediately
      // The homepage's refreshSession will handle the session check
      setIsCheckingAuth(false);
    }
  }, [mounted, checkSession]);

  /**
   * Login function - authenticates user and sets session
   * @returns User data from login response
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const result = response.data;
      const userData = {
        id: result.userId,
        name: result.userName,
        email: result.userEmail,
        role: result.userRole ?? "user",
      };
      setIsLoggedIn(true);
      setUser(userData);
      Cookies.set("session_id", result.sessionId);

      // Set necessary attributes in local storage
      localStorage.setItem("isAuth", "true");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", result.sessionId);
      localStorage.setItem("getSession", JSON.stringify(result));

      // Return user data for immediate use (e.g., in toast notifications)
      return userData;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout function - clears session and user data
   */
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      clearAuthData();
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        isCheckingAuth,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
