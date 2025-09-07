import { useCallback, useState, useEffect } from "react";

// Offline demo mode - simulates auth without Supabase
export function useOfflineDemo() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage for persisted demo login state
    if (typeof window !== "undefined") {
      return localStorage.getItem("demo-logged-in") === "true";
    }
    return false;
  });
  const [loading, setLoading] = useState(false);

  // Persist login state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("demo-logged-in", isLoggedIn.toString());
    }
  }, [isLoggedIn]);

  // Prevent loops by only dispatching event when isLoggedIn changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event('demo-auth-change'));
    }
  }, [isLoggedIn]);

  const mockUser = isLoggedIn ? { 
    id: "demo-user", 
    email: "demo@example.com",
    user_metadata: { name: "Demo User" },
    aud: "authenticated",
    role: "authenticated"
  } : null;

  const login = useCallback(() => {
    if (loading || isLoggedIn) return; // prevent multiple logins or loops
    console.log("🚀 Demo login starting...");
    setLoading(true);
    // Simulate LinkedIn OAuth flow
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
      console.log("✅ Demo login completed");

      // Redirect to dashboard after successful login
      if (typeof window !== "undefined") {
        window.location.href = '/dashboard';
      }
    }, 1000);
  }, [loading, isLoggedIn]);

  const logout = useCallback(() => {
    if (loading || !isLoggedIn) return; // prevent multiple logouts or loops
    console.log("👋 Demo logout starting...");
    setIsLoggedIn(false);
    setLoading(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem("demo-logged-in");
      // Redirect to home after logout
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }

    console.log("✅ Demo logout completed");
  }, [loading, isLoggedIn]);

  return { 
    user: mockUser,
    loading, 
    login, 
    logout 
  };
}