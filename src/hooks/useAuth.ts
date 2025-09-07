import { useEffect, useState, useCallback } from "react";
import { supabase, supabaseAvailable } from "@/integrations/supabase/client";
import { ensureMatchedPod } from "@/lib/match";
import { useOfflineDemo } from "./useOfflineDemo";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);

  // Fallback to offline demo
  const offlineDemo = useOfflineDemo();

  useEffect(() => {
    // Check for offline admin login first - this takes priority
    const checkOfflineAdmin = () => {
      if (typeof window !== "undefined") {
        const isAdminOffline = localStorage.getItem("admin-logged-in") === "true";
        if (isAdminOffline) {
          console.log("✅ Offline admin session detected - setting up admin user");

          // Create a proper admin user object
          const adminUser = {
            id: "admin-user-offline",
            email: "celia@engagepods.com",
            user_metadata: { 
              name: "Admin User (Offline)", 
              is_admin: true,
              full_name: "Admin User",
              avatar_url: null
            },
            app_metadata: { 
              is_admin: true,
              role: "admin",
              provider: "offline"
            },
            aud: "authenticated",
            role: "authenticated",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString()
          };
          setUser(adminUser as any);
          setLoading(false);

          // Clear any demo state that might interfere
          localStorage.removeItem("demo-logged-in");

          console.log("🎯 Admin offline user configured:", adminUser.email);
          return true;
        }
      }
      return false;
    };

    // If offline admin session exists, use it (highest priority)
    if (checkOfflineAdmin()) {
      return;
    }

    // If Supabase is not available, use offline demo (but not if admin is logged in)
    if (!supabaseAvailable) {
      console.log("🔄 Using offline demo mode as fallback");
      setUser(offlineDemo.user as any);
      setLoading(offlineDemo.loading);
      return;
    }

    // Original Supabase flow (only runs if supabaseAvailable is true and no admin offline)
    console.log("🔗 Initializing Supabase auth flow");
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
        setLoading(false);
        if (data.session?.user) {
          const { id } = data.session.user;
          await supabase.from("profiles").upsert({ id });
          try { await ensureMatchedPod(); } catch {}
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setLoading(false);
      }
    };

    initAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      // Don't override offline admin session
      if (localStorage.getItem("admin-logged-in") === "true") {
        console.log("🛡️ Skipping auth state change - admin offline session active");
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        const { id } = session.user;
        await supabase.from("profiles").upsert({ id });
        try { await ensureMatchedPod(); } catch {}
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [offlineDemo.user?.id, offlineDemo.loading]);

  // NEW: Sign in with email magic link (compatible avec Login page)
  const signInWithEmail = useCallback(async (email: string) => {
    // Don't allow if admin is offline
    if (localStorage.getItem("admin-logged-in") === "true") {
      console.log("🛡️ Admin already logged in offline");
      return { data: null, error: { message: "Admin already logged in" } };
    }

    if (!supabaseAvailable) {
      // Simulate success in offline mode
      console.log("🔄 Simulating magic link send in offline mode");
      return { data: { user: null, session: null }, error: null };
    }

    try {
      const result = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      return result;
    } catch (error: any) {
      console.error("Magic link send failed:", error);
      return { data: null, error };
    }
  }, []);

  // NEW: Sign in with OAuth provider (compatible avec Login page)
  const signInWithProvider = useCallback(async (provider: 'google' | 'linkedin' | 'github') => {
    // Don't allow if admin is offline
    if (localStorage.getItem("admin-logged-in") === "true") {
      console.log("🛡️ Admin already logged in offline");
      return { data: null, error: { message: "Admin already logged in" } };
    }

    if (!supabaseAvailable) {
      // Simulate success in offline mode
      console.log(`🔄 Simulating ${provider} login in offline mode`);
      return { data: { user: null, session: null }, error: null };
    }

    try {
      const result = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      return result;
    } catch (error: any) {
      console.error(`${provider} login failed:`, error);
      return { data: null, error };
    }
  }, []);

  // Original login method (for backward compatibility)
  const login = useCallback(async () => {
    // Don't allow regular login if admin is already logged in offline
    if (localStorage.getItem("admin-logged-in") === "true") {
      console.log("🛡️ Admin already logged in offline");
      return;
    }
    if (!supabaseAvailable) {
      offlineDemo.login();
      return;
    }

    try {
      const redirectTo = window.location.origin;
      await supabase.auth.signInWithOAuth({ provider: "linkedin", options: { redirectTo } });
    } catch (error) {
      console.error("Login failed, falling back to demo:", error);
      offlineDemo.login();
    }
  }, [offlineDemo]);

  const logout = useCallback(async () => {
    console.log("👋 Starting logout process");
    // Clear offline admin session
    if (typeof window !== "undefined") {
      const wasAdminOffline = localStorage.getItem("admin-logged-in") === "true";
      localStorage.removeItem("admin-logged-in");

      if (wasAdminOffline) {
        console.log("🛡️ Admin offline session cleared");
        // Force page reload to reset state
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
        return;
      }
    }
    if (!supabaseAvailable) {
      offlineDemo.logout();
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      offlineDemo.logout();
    }
  }, [offlineDemo]);

  // Helper to check if current user is admin
  const isAdmin = user?.user_metadata?.is_admin === true || user?.app_metadata?.is_admin === true;

  return { 
    user, 
    loading, 
    login, 
    logout,
    isAdmin,
    // NEW: Add these methods for Login page compatibility
    signInWithEmail,
    signInWithProvider
  };
}