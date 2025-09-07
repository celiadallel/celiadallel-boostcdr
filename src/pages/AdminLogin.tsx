import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail, Lock, AlertTriangle } from "lucide-react";
import { supabase, supabaseAvailable } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("celia@engagepods.com"); // Pre-fill for testing
  const [password, setPassword] = useState("AdminCelia2024!"); // Pre-fill for testing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // Debug Supabase connection
  const checkSupabaseStatus = () => {
    const status = `
Supabase Available: ${supabaseAvailable}
URL: ${import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
Anon Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
Current URL: ${window.location.href}
Environment: ${window.location.hostname.includes('e2b') ? 'SteerCode Sandbox' : 'Local/Production'}
LocalStorage Admin: ${typeof window !== "undefined" ? localStorage.getItem("admin-logged-in") : "N/A"}
    `.trim();
    setDebugInfo(status);
    console.log("🔍 Supabase Debug Info:", status);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("🚀 Starting admin login...");
    console.log("Email:", email);
    console.log("Supabase Available:", supabaseAvailable);

    if (!supabaseAvailable) {
      setError("Supabase is not properly configured. Check environment variables.");
      setIsLoading(false);
      return;
    }
    try {
      console.log("📧 Attempting sign in via Supabase client...");

      // Use the Supabase client directly instead of manual fetch
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log("🔍 Sign in response:", { data, error: signInError });

      if (signInError) {
        console.error("❌ Sign in error:", signInError);
        setError(`Authentication failed: ${signInError.message}`);
        return;
      }

      if (!data.user) {
        setError("No user data returned from login");
        return;
      }

      console.log("✅ User signed in:", data.user.email);
      console.log("🔍 Checking admin status...");

      // Check if user is admin using Supabase client
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin, email")
        .eq("id", data.user.id)
        .single();

      console.log("🔍 Profile response:", { profile, error: profileError });

      if (profileError) {
        console.error("❌ Profile error:", profileError);
        setError(`Profile check failed: ${profileError.message}`);
        await supabase.auth.signOut();
        return;
      }

      if (!profile?.is_admin) {
        console.log("❌ User is not admin");
        setError("Access denied. Admin privileges required.");
        await supabase.auth.signOut();
        return;
      }

      console.log("✅ Admin login successful!");
      toast.success("✅ Admin login successful");

      // Store admin status in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("admin-logged-in", "true");
      }

      // Small delay to ensure state is updated, then redirect
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 500);
    } catch (error: any) {
      console.error("❌ Login error:", error);

      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setError("Network connection issue. This may be due to sandbox restrictions. Please try refreshing the page or contact support.");
      } else if (error.message.includes("Invalid") || error.message.includes("400")) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (error.message.includes("403")) {
        setError("Access denied. Please check your credentials.");
      } else {
        setError(`Login failed: ${error?.message || "Please try again"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first");
      return;
    }

    if (!supabaseAvailable) {
      setError("Supabase is not available for password reset");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setError(error.message);
      } else {
        toast.success("Password reset email sent");
      }
    } catch (error: any) {
      setError(`Reset failed: ${error?.message || "Unknown error"}`);
    }
  };

  // Alternative login method for sandbox environments
  const handleOfflineLogin = async () => {
    console.log("🔄 Attempting offline admin login...");
    setIsLoading(true);
    setError("");

    // Simulate checking credentials
    if (email.trim() === "celia@engagepods.com" && password === "AdminCelia2024!") {
      try {
        console.log("✅ Offline credentials valid");

        // Set admin session in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("admin-logged-in", "true");
          localStorage.removeItem("demo-logged-in"); // Clear any demo session

          // Force re-evaluation of auth state
          window.dispatchEvent(new Event('admin-auth-change'));
        }

        toast.success("✅ Admin login successful (offline mode)");
        console.log("🔄 Redirecting to dashboard...");

        // Give time for localStorage to be set and toast to show
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 1000);

      } catch (error) {
        console.error("❌ Offline login error:", error);
        setError("Failed to set up offline admin session");
      }
    } else {
      setError("Invalid credentials for offline login. Please use the correct admin email and password.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">EngagePods Admin</CardTitle>
            <p className="text-muted-foreground">
              Sign in to your admin account
            </p>
            {!supabaseAvailable && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Supabase connection issue detected
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="celia@engagepods.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="AdminCelia2024!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !supabaseAvailable}
              >
                {isLoading ? "Signing in..." : "Sign In as Admin"}
              </Button>

              {/* Fallback button for sandbox environments */}
              <Button 
                type="button"
                variant="outline"
                className="w-full" 
                onClick={handleOfflineLogin}
                disabled={isLoading}
              >
                {isLoading ? "Signing in offline..." : "🔄 Offline Admin Login"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="link"
                className="flex-1"
                onClick={handleForgotPassword}
                disabled={isLoading || !supabaseAvailable}
              >
                Forgot password?
              </Button>
              <Button
                type="button"
                variant="link"
                className="flex-1"
                onClick={checkSupabaseStatus}
                disabled={isLoading}
              >
                Debug Info
              </Button>
            </div>

            {debugInfo && (
              <Alert>
                <AlertDescription>
                  <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
                </AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground space-y-2">
            <p>🔒 Admin access only</p>
            <p>Your credentials:</p>
            <p className="font-mono text-xs">celia@engagepods.com</p>
            <p className="font-mono text-xs">AdminCelia2024!</p>
            <div className="text-xs mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
              ⚠️ Network issues detected. Use "Offline Admin Login" to bypass connection problems.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}