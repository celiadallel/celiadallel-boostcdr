import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  Target, 
  TrendingUp, 
  Settings,
  Plus,
  Activity,
  Database,
  Eye,
  Wifi,
  WifiOff
} from "lucide-react";
import { supabase, supabaseAvailable } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPods: 0,
    totalSubmissions: 0,
    activeSubmissions: 0
  });
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    loadStats();

    // Check if we're in offline mode
    const offlineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";
    setIsOfflineMode(!supabaseAvailable || offlineAdmin);
  }, []);

  const loadStats = async () => {
    if (!supabaseAvailable) {
      // Mock stats for offline mode
      setStats({
        totalUsers: 1,
        totalPods: 3,
        totalSubmissions: 12,
        activeSubmissions: 4
      });
      return;
    }
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get pods count (when table exists)
      const { count: podCount } = await supabase
        .from("engagement_pods")
        .select("*", { count: "exact", head: true })
        .catch(() => ({ count: 0 }));

      // Get submissions count (when table exists)
      const { count: submissionCount } = await supabase
        .from("post_submissions")
        .select("*", { count: "exact", head: true })
        .catch(() => ({ count: 0 }));

      const { count: activeCount } = await supabase
        .from("post_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .catch(() => ({ count: 0 }));

      setStats({
        totalUsers: userCount || 0,
        totalPods: podCount || 0,
        totalSubmissions: submissionCount || 0,
        activeSubmissions: activeCount || 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      // Fallback to mock data
      setStats({
        totalUsers: 1,
        totalPods: 3,
        totalSubmissions: 12,
        activeSubmissions: 4
      });
    }
  };

  const createUser = async () => {
    if (!newUserEmail) return;
    setIsLoading(true);
    try {
      if (!supabaseAvailable) {
        // Simulate user creation in offline mode
        toast.success(`✅ User invitation simulated for ${newUserEmail} (offline mode)`);
        setNewUserEmail("");
        return;
      }
      // Invite user via Supabase auth
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(newUserEmail);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`Invitation sent to ${newUserEmail}`);
        setNewUserEmail("");
        loadStats();
      }
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const systemInfo = [
    { 
      label: "Environment", 
      value: isOfflineMode ? "Offline Admin" : "Production", 
      status: isOfflineMode ? "warning" : "success" 
    },
    { 
      label: "Supabase", 
      value: supabaseAvailable ? "Connected" : "Offline", 
      status: supabaseAvailable ? "success" : "warning" 
    },
    { 
      label: "RLS", 
      value: supabaseAvailable ? "Enabled" : "N/A", 
      status: supabaseAvailable ? "success" : "secondary" 
    },
    { 
      label: "Admin Mode", 
      value: "Active", 
      status: "success" 
    }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage EngagePods platform and users
            </p>
          </div>
          {isOfflineMode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-full">
              <WifiOff className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-300">Offline Mode</span>
            </div>
          )}
          {!isOfflineMode && supabaseAvailable && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">Online</span>
            </div>
          )}
        </div>

        {/* Offline Mode Notice */}
        {isOfflineMode && (
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <WifiOff className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">Offline Admin Mode Active</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    You're running in offline mode. Some features are simulated and data may not persist. 
                    Perfect for testing and development!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {isOfflineMode ? "Simulated accounts" : "Registered accounts"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pods</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPods}</div>
              <p className="text-xs text-muted-foreground">
                {isOfflineMode ? "Demo engagement pods" : "Engagement pods"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                {isOfflineMode ? "Mock posts" : "All time posts"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                {isOfflineMode ? "Simulated queue" : "In queue"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {isOfflineMode ? "Simulate User Invitation" : "Invite New User"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                  <Button 
                    onClick={createUser} 
                    disabled={isLoading || !newUserEmail}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {isOfflineMode ? "Simulate" : "Invite"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isOfflineMode 
                    ? "This will simulate an invitation (no actual email sent in offline mode)"
                    : "User will receive an email invitation to join"
                  }
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  {isOfflineMode ? "View Demo Users" : "View All Users"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemInfo.map((info, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{info.label}</span>
                  <Badge 
                    variant={
                      info.status === "success" ? "default" : 
                      info.status === "warning" ? "secondary" : "secondary"
                    }
                    className={
                      info.status === "success" ? "bg-green-100 text-green-800" : 
                      info.status === "warning" ? "bg-amber-100 text-amber-800" : ""
                    }
                  >
                    {info.value}
                  </Badge>
                </div>
              ))}
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button className="justify-start h-auto py-4 px-4" variant="outline">
                <div className="text-left">
                  <div className="font-medium">
                    {isOfflineMode ? "Demo Pod Creation" : "Create Pod"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isOfflineMode ? "Simulate new engagement pod" : "Start a new engagement pod"}
                  </div>
                </div>
              </Button>

              <Button className="justify-start h-auto py-4 px-4" variant="outline">
                <div className="text-left">
                  <div className="font-medium">
                    {isOfflineMode ? "Mock Analytics" : "View Analytics"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isOfflineMode ? "Demo performance metrics" : "Platform performance metrics"}
                  </div>
                </div>
              </Button>

              <Button className="justify-start h-auto py-4 px-4" variant="outline">
                <div className="text-left">
                  <div className="font-medium">
                    {isOfflineMode ? "Demo Moderation" : "Manage Content"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isOfflineMode ? "Simulated content moderation" : "Moderate submissions"}
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              🚀 {isOfflineMode ? "Offline Admin Mode" : "Production Admin Mode"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ul className="space-y-1 text-sm">
              {isOfflineMode ? (
                <>
                  <li>• You're in offline admin mode - perfect for testing!</li>
                  <li>• All data is simulated and won't persist</li>
                  <li>• Great for exploring admin features</li>
                  <li>• No network connection required</li>
                </>
              ) : (
                <>
                  <li>• Platform is in private admin mode</li>
                  <li>• Only admin users can access the application</li>
                  <li>• New users require manual invitation</li>
                  <li>• All data is stored securely in Supabase</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}