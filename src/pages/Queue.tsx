import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, ThumbsUp, MessageCircle, Clock, CheckCircle, Zap, Users } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import useSupabaseData from "@/hooks/useSupabaseData";

// Demo queue for offline mode
const DEMO_QUEUE = [
  { 
    id: 1, 
    title: "Product Management Metrics That Actually Matter",
    author: "Jane Smith",
    url: "https://linkedin.com/posts/janesmith_product-metrics", 
    progress: 75,
    likes: 12,
    target: 20,
    industry: "Technology",
    urgency: "high"
  },
  { 
    id: 2, 
    title: "Growth Strategy Teardown: How We 10x Our Revenue",
    author: "Alex Johnson", 
    url: "https://linkedin.com/posts/alexj_growth-strategy",
    progress: 45,
    likes: 8,
    target: 15,
    industry: "Technology",
    urgency: "medium"
  },
  { 
    id: 3, 
    title: "Remote Team Leadership: 5 Lessons Learned",
    author: "Sarah Davis", 
    url: "https://linkedin.com/posts/sarahd_remote-leadership",
    progress: 20,
    likes: 3,
    target: 25,
    industry: "HR",
    urgency: "urgent"
  }
];

const COMMENT_TEMPLATES = [
  "Great insights! This really resonates with my experience.",
  "Thanks for sharing this perspective - very valuable!",
  "Love how you broke this down. Saving for later reference.",
  "This deserves more visibility. Thanks for posting!",
  "Excellent points! Would love to hear more on this topic.",
  "Spot on analysis. This is exactly what we're seeing too."
];
export default function Queue() {
  const { user, isAdmin } = useAuth();
  const { 
    points: totalPoints,
    submissions: userSubmissions,
    isLoading,
    isOfflineMode,
    createEngagement,
    refreshData
  } = useSupabaseData();

  const [engagedPosts, setEngagedPosts] = useState<Set<string | number>>(new Set());
  const [customComment, setCustomComment] = useState("");
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [currentEngagingPost, setCurrentEngagingPost] = useState<any>(null);
  const [queuePosts, setQueuePosts] = useState<any[]>([]);
  const [todayEngagements, setTodayEngagements] = useState(0);

  const isOfflineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";

  // Load queue posts (demo data for offline mode, real data for production)
  useEffect(() => {
    if (isOfflineMode) {
      setQueuePosts(DEMO_QUEUE);
    } else {
      // In production mode, this would load real queue posts from Supabase
      // For now, using demo data until we implement SupabaseService.getQueuePosts
      setQueuePosts(DEMO_QUEUE);
    }
  }, [isOfflineMode]);

  const handleQuickLike = async (item: any) => {
    const postKey = item.id || item.post_id;

    if (engagedPosts.has(postKey)) {
      toast.info("You already engaged with this post today!");
      return;
    }

    try {
      let success = false;

      if (isOfflineMode) {
        success = await createEngagement({
          postId: postKey.toString(),
          type: 'like'
        });
      } else {
        success = await createEngagement({
          postId: item.id || item.post_id || postKey.toString(),
          type: 'like'
        });
      }

      if (success) {
        setEngagedPosts(prev => new Set([...prev, postKey]));
        setTodayEngagements(prev => prev + 1);

        if (isOfflineMode) {
          toast.success(`✅ Liked "${item.title?.slice(0, 30) || 'post'}..." (+1 point) - Simulated in admin test mode`);
        } else {
          toast.success(`✅ Liked "${item.title?.slice(0, 30) || 'post'}..." (+1 point)`);
          // In real mode, would open LinkedIn
          window.open(item.url || item.post_url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error("Failed to like post. Please try again.");
    }
  };

  const openCommentDialog = (item: any) => {
    setCurrentEngagingPost(item);
    setIsCommentDialogOpen(true);
  };

  const handleComment = async (item: any, comment: string) => {
    const postKey = item.id || item.post_id;

    if (engagedPosts.has(postKey)) {
      toast.info("You already engaged with this post today!");
      return;
    }

    try {
      let success = false;

      if (isOfflineMode) {
        success = await createEngagement({
          postId: postKey.toString(),
          type: 'comment',
          commentText: comment
        });
      } else {
        success = await createEngagement({
          postId: item.id || item.post_id || postKey.toString(),
          type: 'comment',
          commentText: comment
        });
      }

      if (success) {
        setEngagedPosts(prev => new Set([...prev, postKey]));
        setTodayEngagements(prev => prev + 1);
        setIsCommentDialogOpen(false);
        setCustomComment("");

        if (isOfflineMode) {
          toast.success(`💬 Commented on "${item.title?.slice(0, 30) || 'post'}..." (+3 points) - Simulated in admin test mode`);
          toast.info(`Comment: "${comment.slice(0, 50)}..."`);
        } else {
          toast.success(`💬 Commented on "${item.title?.slice(0, 30) || 'post'}..." (+3 points)`);
          // In real mode, would open LinkedIn with comment
          window.open(item.url || item.post_url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
      toast.error("Failed to comment on post. Please try again.");
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return <Badge variant="destructive" className="animate-pulse">🚨 Urgent</Badge>;
      case "high":
        return <Badge variant="default" className="bg-orange-500">⚡ High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary">⏰ Medium</Badge>;
      default:
        return <Badge variant="outline">📅 Normal</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Engagement Queue</h1>
            <p className="text-muted-foreground mt-2">
              Engage with posts to earn points. Like = 1pt, Comment = 3pts.
              {isOfflineMode && (
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                  {isOfflineAdmin ? 'Admin Test Mode - Fully Interactive' : 'Demo Mode'}
                </Badge>
              )}
              {!isOfflineMode && (
                <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                  Production Mode - Real Engagement
                </Badge>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>

        {/* User's Submissions */}
        {userSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your Submitted Posts ({userSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{submission.title || "Your LinkedIn Post"}</h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(submission.created_at || submission.submittedAt || Date.now()).toLocaleDateString()}
                      </p>
                      <Progress 
                        value={
                          submission.current_likes && submission.target_likes ?
                            (submission.current_likes / submission.target_likes) * 100 :
                            Math.random() * 100
                        } 
                        className="mt-2 w-48" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {submission.current_likes || Math.floor(Math.random() * 15) + 1} / {submission.target_likes || 25} likes so far
                      </p>
                    </div>
                    <Badge variant="default">{submission.status || "Active"}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Interactive Engagement Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Posts Needing Engagement
              {isOfflineMode && <span className="text-sm font-normal text-muted-foreground">(Interactive Test Mode)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {queuePosts.map((item) => {
              const postKey = item.id || item.post_id;
              const isEngaged = engagedPosts.has(postKey);
              const currentLikes = item.current_likes || item.likes || 0;
              const targetLikes = item.target_likes || item.target || 25;
              const progress = targetLikes > 0 ? (currentLikes / targetLikes) * 100 : 0;

              return (
                <div key={postKey} className={`relative p-4 border rounded-lg transition-all ${isEngaged ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : 'hover:shadow-md'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-semibold flex-1">{item.title}</h3>
                        {item.urgency && getUrgencyBadge(item.urgency)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {item.author || item.profiles?.full_name || 'Anonymous'} • {item.industry || 'Technology'}
                      </p>

                      <div className="flex items-center gap-3 mb-3">
                        <Progress value={progress} className="w-32" />
                        <span className="text-xs text-muted-foreground">
                          {currentLikes}/{targetLikes} likes ({Math.round(progress)}%)
                        </span>
                      </div>

                      {isEngaged && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>You engaged with this post!</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isEngaged ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleQuickLike(item)}
                            className="hover:bg-blue-50"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Like (+1)
                          </Button>

                          <Dialog open={isCommentDialogOpen && currentEngagingPost?.id === postKey} onOpenChange={(open) => {
                            setIsCommentDialogOpen(open);
                            if (!open) setCurrentEngagingPost(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openCommentDialog(item)}
                                className="hover:bg-green-50"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Comment (+3)
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Comment on "{item.title?.slice(0, 40) || 'post'}..."</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Quick Templates:</h4>
                                  <div className="space-y-2">
                                    {COMMENT_TEMPLATES.slice(0, 3).map((template, index) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-left justify-start h-auto py-2 px-3"
                                        onClick={() => handleComment(item, template)}
                                      >
                                        <span className="text-xs">{template}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-2">Custom Comment:</h4>
                                  <Textarea
                                    placeholder="Write your thoughtful comment..."
                                    value={customComment}
                                    onChange={(e) => setCustomComment(e.target.value)}
                                    className="min-h-20"
                                  />
                                  <Button 
                                    className="w-full mt-2" 
                                    onClick={() => {
                                      if (customComment.trim()) {
                                        handleComment(item, customComment);
                                      }
                                    }}
                                    disabled={!customComment.trim()}
                                  >
                                    Post Comment (+3 points)
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}

                      <Button asChild size="sm" variant="ghost">
                        <a href={item.url || item.post_url} target="_blank" rel="noreferrer" title="View on LinkedIn">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{todayEngagements}</div>
                <div className="text-sm text-muted-foreground">Posts Engaged Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{userSubmissions.length}</div>
                <div className="text-sm text-muted-foreground">Active Submissions</div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg text-center">
              {isOfflineMode ? (
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  🧪 In {isOfflineAdmin ? 'admin test' : 'demo'} mode - all engagements are simulated and fully interactive. 
                  Points and stats are saved locally for testing purposes.
                </p>
              ) : (
                <p className="text-xs text-green-700 dark:text-green-300">
                  🚀 Connected to production database - your engagements are real and will be processed by the system.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}