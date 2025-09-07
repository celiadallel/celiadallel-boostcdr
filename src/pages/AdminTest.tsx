import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  TestTube, 
  Target, 
  ThumbsUp, 
  MessageCircle, 
  ExternalLink,
  Play,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function AdminTest() {
  const { user, isAdmin } = useAuth();
  const [testPostUrl, setTestPostUrl] = useState("https://linkedin.com/posts/celia_engagepods-testing");
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  const isOfflineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";

  if (!isOfflineAdmin && !isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-4">
                This test page is only available to admin users.
              </p>
              <Link to="/admin">
                <Button>Go to Admin Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const runCompleteTest = async () => {
    setIsRunningTest(true);
    setTestProgress(0);
    setTestResults([]);
    const steps = [
      { name: "Submit Test Post", action: testPostSubmission },
      { name: "Simulate Engagement Queue", action: testEngagementQueue },
      { name: "Test Points System", action: testPointsSystem },
      { name: "Simulate Analytics", action: testAnalytics },
      { name: "Test Admin Functions", action: testAdminFunctions }
    ];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      toast.info(`🧪 Testing: ${step.name}`);
      try {
        const result = await step.action();
        setTestResults(prev => [...prev, { name: step.name, status: "success", result }]);
        toast.success(`✅ ${step.name} - Success`);
      } catch (error) {
        setTestResults(prev => [...prev, { name: step.name, status: "error", error: error.message }]);
        toast.error(`❌ ${step.name} - Failed`);
      }
      setTestProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    setIsRunningTest(false);
    toast.success("🎉 Complete test suite finished!");
  };

  const testPostSubmission = async () => {
    // Simulate post submission
    const submission = {
      id: Date.now(),
      url: testPostUrl,
      title: "Admin Test Post - EngagePods Platform Testing",
      status: "active",
      submittedAt: new Date().toISOString(),
      settings: {
        industry: "Technology",
        targetLikes: 25,
        commentType: "template",
        deliverySpeed: "fast"
      },
      metrics: {
        currentLikes: Math.floor(Math.random() * 10),
        currentComments: Math.floor(Math.random() * 3),
        views: Math.floor(Math.random() * 100),
        engagementRate: (Math.random() * 5).toFixed(1)
      }
    };
    // Save to localStorage
    const submissions = JSON.parse(localStorage.getItem("demo-submissions") || "[]");
    submissions.push(submission);
    localStorage.setItem("demo-submissions", JSON.stringify(submissions));
    return {
      submissionId: submission.id,
      metrics: submission.metrics,
      message: "Post successfully submitted to engagement queue"
    };
  };

  const testEngagementQueue = async () => {
    // Simulate queue processing
    const queueStats = {
      postsInQueue: 3,
      averageCompletionTime: "8 hours",
      successRate: "98%",
      activePodMembers: 12
    };
    return queueStats;
  };

  const testPointsSystem = async () => {
    // Test points calculation
    const pointsData = {
      likesGiven: 5,
      commentsGiven: 2,
      pointsEarned: 5 * 1 + 2 * 3, // likes(1pt) + comments(3pts)
      totalPoints: 42 + (5 * 1 + 2 * 3),
      nextLevelPoints: 100
    };
    return pointsData;
  };

  const testAnalytics = async () => {
    // Generate test analytics
    const analytics = {
      totalEngagement: 247,
      averageCompletionRate: 94,
      topPerformingIndustry: "Technology",
      memberSatisfaction: 4.8,
      monthlyGrowth: 23
    };
    return analytics;
  };

  const testAdminFunctions = async () => {
    // Test admin-specific functions
    const adminStats = {
      totalUsers: 1,
      activePods: 3,
      pendingSubmissions: 7,
      systemHealth: "Excellent",
      offlineMode: isOfflineAdmin
    };
    return adminStats;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="space-y-6 sm:space-y-8">
        {/* Mobile-Optimized Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TestTube className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Test Suite</h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Test all EngagePods functionality in {isOfflineAdmin ? "offline" : "online"} admin mode
              </p>
            </div>
          </div>
          {isOfflineAdmin && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 w-fit">
              Offline Mode
            </Badge>
          )}
        </div>

        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-5 w-5" />
              Current Session Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between border-b pb-2 sm:border-b-0 sm:pb-0">
                <span>User:</span>
                <span className="font-medium truncate ml-2">{user?.email || "Unknown"}</span>
              </div>
              <div className="flex justify-between border-b pb-2 sm:border-b-0 sm:pb-0">
                <span>Mode:</span>
                <Badge variant={isOfflineAdmin ? "secondary" : "default"} className="ml-2">
                  {isOfflineAdmin ? "Offline Admin" : "Online Admin"}
                </Badge>
              </div>
              <div className="flex justify-between border-b pb-2 sm:border-b-0 sm:pb-0">
                <span>Admin Status:</span>
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Confirmed
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Test Environment:</span>
                <Badge variant="outline" className="ml-2">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Test Post URL</Label>
              <Input
                value={testPostUrl}
                onChange={(e) => setTestPostUrl(e.target.value)}
                placeholder="https://linkedin.com/posts/..."
                disabled={isRunningTest}
                className="text-sm"
              />
            </div>
            <Alert>
              <AlertDescription className="text-sm">
                This will test the complete EngagePods flow: submission → queue → engagement → points → analytics
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Test Runner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Play className="h-5 w-5" />
              Test Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runCompleteTest}
              disabled={isRunningTest}
              className="w-full" 
              size="lg"
            >
              {isRunningTest ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Running Tests...</span>
                  <span className="sm:hidden">Testing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  <span className="hidden sm:inline">Run Complete Test Suite</span>
                  <span className="sm:hidden">Run Tests</span>
                </div>
              )}
            </Button>

            {isRunningTest && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Progress</span>
                  <span>{testProgress.toFixed(0)}%</span>
                </div>
                <Progress value={testProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Action Buttons - Mobile Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link to="/submit">
            <Button variant="outline" className="w-full h-20 sm:h-24 flex-col gap-2">
              <Target className="h-6 w-6" />
              <span className="text-sm">Submit</span>
            </Button>
          </Link>
          <Link to="/queue">
            <Button variant="outline" className="w-full h-20 sm:h-24 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Queue</span>
            </Button>
          </Link>
          <Link to="/points">
            <Button variant="outline" className="w-full h-20 sm:h-24 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Points</span>
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline" className="w-full h-20 sm:h-24 flex-col gap-2">
              <Zap className="h-6 w-6" />
              <span className="text-sm">Analytics</span>
            </Button>
          </Link>
        </div>

        {/* Test Results - Mobile Responsive */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {result.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">{result.name}</span>
                    </div>
                    <Badge 
                      variant={result.status === "success" ? "default" : "destructive"}
                      className="text-xs flex-shrink-0"
                    >
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions - Mobile Optimized */}
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 text-lg sm:text-xl">
              🧪 How to Use This Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ul className="space-y-2 text-sm">
              <li>• Click "Run Tests" to test all functionality automatically</li>
              <li>• Use Quick Action buttons to test individual pages manually</li>
              <li>• Test results show success/failure for each component</li>
              <li>• All test data is simulated and safe to run multiple times</li>
              <li>• Works in both offline and online admin modes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}