import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Star,
  Award,
  Flame,
  Calendar,
  Users,
  ThumbsUp,
  MessageCircle,
  Plus,
  Minus,
  Clock,
  Zap,
  Crown,
  Medal,
  CheckCircle,
  TrendingDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import useSupabaseData from "@/hooks/useSupabaseData";
import { toast } from "sonner";

const DEMO_ACHIEVEMENTS = [
  {
    id: "first_like",
    name: "First Like",
    description: "Give your first like",
    icon: ThumbsUp,
    points: 1,
    rarity: "common"
  },
  {
    id: "first_comment",
    name: "Conversationalist",
    description: "Leave your first comment",
    icon: MessageCircle,
    points: 5,
    rarity: "common"
  },
  {
    id: "ten_engagements",
    name: "Community Helper",
    description: "Complete 10 engagements",
    icon: Users,
    points: 25,
    rarity: "rare"
  },
  {
    id: "weekly_streak",
    name: "Consistency King",
    description: "7-day engagement streak",
    icon: Flame,
    points: 50,
    rarity: "epic"
  },
  {
    id: "hundred_points",
    name: "Century Club",
    description: "Reach 100 points",
    icon: Crown,
    points: 100,
    rarity: "legendary"
  }
];

const DEMO_LEADERBOARD = [
  { rank: 1, name: "You", points: 42, trend: "+5", avatar: "🎯", streak: 3 },
  { rank: 2, name: "Jane Smith", points: 38, trend: "+2", avatar: "👩‍💼", streak: 1 },
  { rank: 3, name: "Alex Johnson", points: 35, trend: "+8", avatar: "👨‍💻", streak: 5 },
  { rank: 4, name: "Maria Garcia", points: 27, trend: "-1", avatar: "👩‍🎨", streak: 0 },
  { rank: 5, name: "David Kim", points: 24, trend: "+3", avatar: "👨‍🔬", streak: 2 },
  { rank: 6, name: "Sarah Chen", points: 22, trend: "+4", avatar: "👩‍🚀", streak: 1 },
  { rank: 7, name: "Mike Wilson", points: 20, trend: "+1", avatar: "👨‍🏫", streak: 0 },
  { rank: 8, name: "Lisa Park", points: 18, trend: "+6", avatar: "👩‍⚕️", streak: 2 }
];

export default function Points() {
  const { user, isAdmin } = useAuth();
  const { 
    points: currentPoints,
    engagements,
    achievements: userAchievements,
    pointHistory,
    leaderboard: realLeaderboard,
    isLoading,
    isOfflineMode,
    updatePoints
  } = useSupabaseData();
  const [weeklyEarned, setWeeklyEarned] = useState(15);
  const [currentStreak, setCurrentStreak] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);

  const isOfflineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";

  // Calculate stats
  const todayEngagements = engagements.filter(eng => {
    const today = new Date().toDateString();
    const engDate = new Date(eng.created_at || eng.timestamp || Date.now()).toDateString();
    return engDate === today;
  }).length;

  const nextLevel = Math.ceil(currentPoints / 50) * 50;
  const progressToNextLevel = currentPoints > 0 ? ((currentPoints % 50) / 50) * 100 : 0;

  // Merge real achievements with demo for display
  const displayedAchievements = DEMO_ACHIEVEMENTS.map(demo => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === demo.id);
    return {
      ...demo,
      unlocked: userAchievement ? userAchievement.is_unlocked : demo.unlocked || false
    };
  });

  // Use real leaderboard if available, otherwise demo
  const displayedLeaderboard = realLeaderboard.length > 0 ? 
    realLeaderboard.map((member, index) => ({
      rank: index + 1,
      name: member.full_name || member.email || 'Anonymous',
      points: member.total_points || 0,
      trend: `+${Math.floor(Math.random() * 10)}`,
      avatar: "👤",
      streak: member.current_streak || 0
    })) :
    DEMO_LEADERBOARD.map(member => 
      member.name === "You" ? { ...member, points: currentPoints } : member
    );

  // Use real point history if available, otherwise demo
  const displayedPointHistory = pointHistory.length > 0 ? 
    pointHistory.map(entry => ({
      id: entry.id,
      action: entry.action,
      points: entry.points,
      timestamp: new Date(entry.created_at),
      user: entry.description || "System"
    })) :
    // Demo data for offline mode
    Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      action: ["Liked post", "Commented on post", "Post submission", "Achievement unlocked"][Math.floor(Math.random() * 4)],
      points: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -5,
      timestamp: new Date(Date.now() - (i + 1) * 1000 * 60 * 30),
      user: ["Jane Smith", "Alex Johnson", "System"][Math.floor(Math.random() * 3)]
    }));

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800 border-gray-200";
      case "rare": return "bg-blue-100 text-blue-800 border-blue-200";
      case "epic": return "bg-purple-100 text-purple-800 border-purple-200";
      case "legendary": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const simulatePointGain = async (points: number, reason: string) => {
    setIsAnimating(true);

    const success = await updatePoints(points, reason);

    if (success) {
      toast.success(`+${points} points for ${reason}!`);
    } else {
      toast.error("Failed to update points");
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };
  const userStats = {
    currentPoints,
    weeklyEarned,
    submissions: 2,
    dailyLimit: 2,
    nextLevel,
    progressToNextLevel,
    currentStreak,
    todayEngagements
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div className="space-y-6">
        {/* Mobile-Optimized Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Points & Rewards</h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Track your progress and compete with others
                {isOfflineMode && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                    {isOfflineAdmin ? 'Admin Test Mode' : 'Demo Mode'}
                  </Badge>
                )}
                {!isOfflineMode && (
                  <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                    Production Mode
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Points Overview Cards - Mobile Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Points</CardTitle>
              <div className={`transition-all duration-300 ${isAnimating ? 'scale-110' : ''}`}>
                <Trophy className={`h-4 w-4 ${isAnimating ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold transition-all duration-300 ${isAnimating ? 'text-yellow-600 scale-105' : ''}`}>
                {userStats.currentPoints}
              </div>
              <p className="text-xs text-green-600">
                +{userStats.weeklyEarned} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className={`h-4 w-4 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.currentStreak}
              </div>
              <p className="text-xs text-muted-foreground">
                days active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Engagements</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.todayEngagements}
              </div>
              <p className="text-xs text-muted-foreground">
                likes and comments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Level</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.nextLevel}</div>
              <div className="mt-2">
                <Progress value={userStats.progressToNextLevel} className="w-full h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {userStats.nextLevel - userStats.currentPoints} points to go
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">
              <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Board</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm">
              <Award className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">Awards</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              <Clock className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Log</span>
            </TabsTrigger>
            {isOfflineAdmin && (
              <TabsTrigger value="simulator" className="text-xs sm:text-sm">
                <Zap className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Simulator</span>
                <span className="sm:hidden">Test</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top 3 Podium */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5" />
                    Top 3
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayedLeaderboard.slice(0, 3).map((member) => (
                    <div 
                      key={member.rank} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        member.name === "You" ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200" : 
                        member.rank === 1 ? "bg-amber-50 dark:bg-amber-900/20" :
                        member.rank === 2 ? "bg-gray-50 dark:bg-gray-900/20" :
                        "bg-orange-50 dark:bg-orange-900/20"
                      }`}
                    >
                      <div className={`text-2xl ${
                        member.rank === 1 ? "🥇" : member.rank === 2 ? "🥈" : "🥉"
                      }`}>
                        {member.rank === 1 ? "🥇" : member.rank === 2 ? "🥈" : "🥉"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{member.avatar}</span>
                          <div>
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {member.points} points
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={member.trend.startsWith('+') ? 'default' : member.trend.startsWith('-') ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {member.trend}
                        </Badge>
                        {member.streak > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-xs">{member.streak}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Full Leaderboard */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pod Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayedLeaderboard.map((member) => (
                      <div 
                        key={member.rank} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                          member.name === "You" ? "bg-primary/10 border border-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-bold">#{member.rank}</span>
                          </div>
                          <div className="text-lg">{member.avatar}</div>
                          <div>
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {member.points} points
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {member.streak > 0 && (
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span className="text-xs">{member.streak}</span>
                            </div>
                          )}
                          <Badge 
                            variant={
                              member.trend.startsWith('+') ? 'default' : 
                              member.trend.startsWith('-') ? 'destructive' : 
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {member.trend.startsWith('+') && <TrendingUp className="h-3 w-3 mr-1" />}
                            {member.trend.startsWith('-') && <TrendingDown className="h-3 w-3 mr-1" />}
                            {member.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scoring System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Scoring System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-blue-500" />
                      <span>Like a post</span>
                    </div>
                    <Badge variant="outline">+1</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      <span>Comment</span>
                    </div>
                    <Badge variant="outline">+3</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span>Submit post</span>
                    </div>
                    <Badge variant="destructive">-5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>Achievement</span>
                    </div>
                    <Badge variant="default">+5-100</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedAchievements.map((achievement) => {
                const IconComponent = achievement.icon;
                const isUnlocked = achievement.unlocked;

                return (
                  <Card 
                    key={achievement.id} 
                    className={`transition-all hover:shadow-md ${
                      isUnlocked ? "border-green-200 bg-green-50/50 dark:bg-green-900/10" : "opacity-75"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isUnlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{achievement.name}</h3>
                            {isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getRarityColor(achievement.rarity)}`}
                            >
                              {achievement.rarity}
                            </Badge>
                            <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                              {achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Point History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayedPointHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-muted/30 rounded-r-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${
                          entry.points > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {entry.points > 0 ? (
                            <Plus className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{entry.action}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.user !== "System" && `with ${entry.user} • `}
                            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={entry.points > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {entry.points > 0 ? "+" : ""}{entry.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulator Tab (Admin Only) */}
          {isOfflineAdmin && (
            <TabsContent value="simulator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Point Simulator (Admin Test Mode)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Test the points system by simulating different actions:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => simulatePointGain(1, "test like")}
                      className="h-auto py-4 flex flex-col gap-2"
                    >
                      <ThumbsUp className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Simulate Like</span>
                      <Badge variant="outline" className="text-xs">+1 point</Badge>
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => simulatePointGain(3, "test comment")}
                      className="h-auto py-4 flex flex-col gap-2"
                    >
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Simulate Comment</span>
                      <Badge variant="outline" className="text-xs">+3 points</Badge>
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => simulatePointGain(25, "test achievement")}
                      className="h-auto py-4 flex flex-col gap-2"
                    >
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">Unlock Achievement</span>
                      <Badge variant="outline" className="text-xs">+25 points</Badge>
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => simulatePointGain(10, "daily streak bonus")}
                      className="h-auto py-4 flex flex-col gap-2"
                    >
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="text-sm">Streak Bonus</span>
                      <Badge variant="outline" className="text-xs">+10 points</Badge>
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      🧪 {isOfflineMode ? 'Admin test mode - points are simulated and saved locally' : 'Production mode - points are saved to Supabase database'}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}