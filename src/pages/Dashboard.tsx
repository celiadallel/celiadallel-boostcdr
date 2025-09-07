import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Plus, 
  Users, 
  Clock,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, supabaseAvailable } from "@/integrations/supabase/client";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    if (!supabaseAvailable) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.is_admin || false);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If user is admin, show admin dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }
  // Mock user data - in real app this would come from API
  const userStats = {
    currentPoints: 42,
    weeklyEarned: 15,
    submissionsToday: 2,
    dailyLimit: 2,
    podName: "Tech Marketing Professionals",
    podMembers: 24,
    rank: 3
  };

  const recentActivity = [
    { 
      type: "like", 
      post: "Product Management Best Practices", 
      author: "Sarah Johnson", 
      points: 1, 
      time: "2h ago" 
    },
    { 
      type: "comment", 
      post: "The Future of AI in Marketing", 
      author: "Mike Chen", 
      points: 3, 
      time: "4h ago" 
    },
    { 
      type: "submission", 
      post: "How We Scaled Our LinkedIn Strategy", 
      author: "You", 
      points: 0, 
      time: "6h ago" 
    }
  ];

  const queuePreview = [
    { 
      title: "Growth Hacking Strategies That Work",
      author: "Alex Rivera",
      priority: "high",
      timeLeft: "1h left"
    },
    { 
      title: "Remote Team Management Tips",
      author: "Emma Davis",
      priority: "medium", 
      timeLeft: "3h left"
    }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your engagement overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.currentPoints}</div>
              <p className="text-xs text-green-600">
                +{userStats.weeklyEarned} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Submissions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.submissionsToday}/{userStats.dailyLimit}
              </div>
              <Progress 
                value={(userStats.submissionsToday / userStats.dailyLimit) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pod Rank</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userStats.rank}</div>
              <p className="text-xs text-muted-foreground">
                of {userStats.podMembers} members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pod</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">{userStats.podName}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.podMembers} active members
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" size="lg">
                <Link to="/submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Post
                  <Badge variant="secondary" className="ml-auto">
                    {userStats.dailyLimit - userStats.submissionsToday} left today
                  </Badge>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link to="/queue">
                  <Clock className="h-4 w-4 mr-2" />
                  View Engagement Queue
                  <Badge variant="outline" className="ml-auto">
                    {queuePreview.length} pending
                  </Badge>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link to="/points">
                  <Trophy className="h-4 w-4 mr-2" />
                  Points & Leaderboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Urgent Queue Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Urgent Engagement Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {queuePreview.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">by {item.author}</span>
                      <Badge 
                        variant={item.priority === 'high' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.timeLeft}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button asChild variant="link" className="w-full">
                <Link to="/queue">View all queue items →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === 'like' && <ThumbsUp className="h-4 w-4" />}
                      {activity.type === 'comment' && <MessageCircle className="h-4 w-4" />}
                      {activity.type === 'submission' && <Plus className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === 'like' && 'Liked'} 
                        {activity.type === 'comment' && 'Commented on'} 
                        {activity.type === 'submission' && 'Submitted'} 
                        "{activity.post}"
                      </p>
                      <p className="text-xs text-muted-foreground">by {activity.author}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.points > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +{activity.points} pts
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-muted-foreground">Posts Engaged</div>
                <Progress value={70} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Goal: 10</div>
              </div>
              <div>
                <div className="text-2xl font-bold">18</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
                <Progress value={90} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Goal: 20</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">Posts Submitted</div>
                <Progress value={100} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Limit: 2</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}