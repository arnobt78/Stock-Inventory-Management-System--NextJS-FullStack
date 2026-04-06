/**
 * Client-safe auth utilities
 * These functions can be safely imported in client components
 */

import Cookies from "js-cookie";
import { User } from "@/types";

/**
 * Get session from client-side
 * Makes an API call to verify the token
 * Note: session_id cookie is httpOnly, so Cookies.get() can't read it
 * We rely on credentials: "include" to automatically send the cookie with the request
 */
export const getSessionClient = async (): Promise<User | null> => {
  try {
    // Note: session_id cookie is httpOnly, so Cookies.get() won't work
    // We must make the API call with credentials: "include" to send the cookie
    // The API will verify the cookie server-side

    // On client side, we'll make an API call to verify the token
    // This avoids using the JWT library on the client side
    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies (including httpOnly cookies)
    });

    if (response.ok) {
      const user = await response.json();
      return user;
    }

    return null;
  } catch (error) {
    return null;
  }
};
