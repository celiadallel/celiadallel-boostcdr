import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Submit from "./pages/Submit";
import Queue from "./pages/Queue";
import Points from "./pages/Points";
import Analytics from "./pages/Analytics";
import AdminLogin from "./pages/AdminLogin";
import AdminTest from "./pages/AdminTest";
import Login from "./pages/Login"; // NEW: Import Login page
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import { I18nProvider } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabaseAvailable } from "@/integrations/supabase/client";
const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();
  const isOfflineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // In production mode, redirect to login if not authenticated
  if (supabaseAvailable && !user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/test" element={<AdminTest />} />
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  return (
    <Routes key={user?.id || 'anonymous'}>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />

      {/* Admin-only routes */}
      <Route 
        path="/admin/dashboard" 
        element={(isAdmin || isOfflineAdmin) ? <AdminDashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/test" 
        element={(isAdmin || isOfflineAdmin) ? <AdminTest /> : <Navigate to="/login" replace />} 
      />
      {/* Redirect logged-in users from home to dashboard */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Index />} 
      />

      {/* Protected routes - require login */}
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route path="/submit" element={user ? <Submit /> : <Navigate to="/login" replace />} />
      <Route path="/queue" element={user ? <Queue /> : <Navigate to="/login" replace />} />
      <Route path="/points" element={user ? <Points /> : <Navigate to="/login" replace />} />
      <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider defaultTheme="system" storageKey="engagepods-theme">
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;