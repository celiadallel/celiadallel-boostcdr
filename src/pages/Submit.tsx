import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Crown, 
  Zap, 
  Target, 
  MessageCircle, 
  ExternalLink, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Play,
  Eye,
  Settings,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import useSupabaseData from "@/hooks/useSupabaseData";

const INDUSTRIES = [
  "Technology", "Marketing", "Finance", "Healthcare", "Education", 
  "Real Estate", "E-commerce", "Consulting", "Manufacturing", "Media",
  "Sales", "HR", "Design", "Legal", "Startup"
];

const COMMENT_TEMPLATES = [
  "Great insights! This really resonates with my experience.",
  "Thanks for sharing this perspective - very valuable!",
  "Love how you broke this down. Saving for later reference.",
  "This deserves more visibility. Thanks for posting!",
  "Excellent points! Would love to hear more on this topic.",
  "Spot on analysis. This is exactly what we're seeing too.",
  "Super helpful content. Thank you for sharing!"
];
export default function Submit() {
  const { user, isAdmin } = useAuth();
  const { 
    points: currentPoints, 
    submissions: activeSubmissions, 
    isLoading,
    isOfflineMode,
    submitPost,
    refreshData
  } = useSupabaseData();
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [likes, setLikes] = useState([25]);
  const [commentType, setCommentType] = useState("template");
  const [customComment, setCustomComment] = useState("");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState("0");
  const [deliverySpeed, setDeliverySpeed] = useState("fast");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlValidated, setUrlValidated] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);

  const isOfflineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";
  const userPlan = "pro";

  const validateUrl = async (inputUrl: string) => {
    if (!inputUrl) {
      setUrlValidated(false);
      return;
    }

    setIsValidatingUrl(true);

    // Simulate URL validation
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (inputUrl.includes("linkedin.com/posts/") || inputUrl.includes("linkedin.com/feed/update/")) {
      setUrlValidated(true);
      toast.success("✅ LinkedIn post URL validated!");
    } else {
      setUrlValidated(false);
      toast.error("❌ Please enter a valid LinkedIn post URL");
    }

    setIsValidatingUrl(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateUrl(url);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [url]);

  const getEngagementPreview = () => {
    const targetLikes = likes[0] || 25;
    const estimatedComments = Math.ceil(targetLikes * 0.15);
    const estimatedViews = targetLikes * 8;
    const completionTime = deliverySpeed === "viral" ? "1-3 hours" : 
                          deliverySpeed === "fast" ? "6-12 hours" : "24-48 hours";

    return {
      targetLikes,
      estimatedComments,
      estimatedViews,
      completionTime,
      engagementRate: ((targetLikes + estimatedComments) / estimatedViews * 100).toFixed(1)
    };
  };

  const preview = getEngagementPreview();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!urlValidated) {
      toast.error("Please enter a valid LinkedIn post URL");
      return;
    }

    if (currentPoints < 5) {
      toast.error("You need at least 5 points to submit a post. Engage with others first!");
      return;
    }
    setIsSubmitting(true);

    try {
      const selectedTemplate = COMMENT_TEMPLATES[parseInt(selectedTemplateIndex)] || COMMENT_TEMPLATES[0];
      const targetLikes = likes[0] || 25;

      const success = await submitPost({
        url,
        title: "Your LinkedIn Post",
        industry,
        targetLikes,
        targetComments: Math.ceil(targetLikes * 0.2),
        deliverySpeed,
        commentStrategy: commentType,
        customComment: commentType === "custom" ? customComment : selectedTemplate
      });

      if (success) {
        const speedText = deliverySpeed === "viral" ? "1-3 hours" : 
                         deliverySpeed === "fast" ? "6-12 hours" : "24-48 hours";

        toast.success(`🚀 Campaign launched successfully! Targeting ${industry} professionals with ${targetLikes} likes goal. Expected completion: ${speedText}`);
        toast.info(`💳 5 points deducted. Current balance: ${currentPoints - 5} points`);

        if (isOfflineMode) {
          // Simulate real-time engagement updates for offline mode
          simulateEngagementUpdates();
        }

        // Reset form
        setUrl("");
        setUrlValidated(false);

        // Refresh data to show updated submissions
        await refreshData();
      } else {
        toast.error("Failed to submit post. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error("An error occurred while submitting your post.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function simulateEngagementUpdates() {
    if (!isOfflineMode) return;
    const updateInterval = deliverySpeed === "viral" ? 30000 : deliverySpeed === "fast" ? 60000 : 120000;

    const updateEngagement = () => {
      const messages = [
        `📈 +${Math.ceil(Math.random() * 3)} likes from ${industry} professionals!`,
        `💬 New comment on your post! Great engagement`,
        `🎯 Campaign in progress - targeting ${industry} community!`,
        `🔥 Your post is trending in the ${industry} community!`
      ];
      toast.success(messages[Math.floor(Math.random() * messages.length)]);
    };

    // Start updates after 10 seconds
    setTimeout(updateEngagement, 10000);
    setTimeout(updateEngagement, updateInterval);
    setTimeout(updateEngagement, updateInterval * 2);
  }

  const canSubmit = currentPoints >= 5 && urlValidated && !isSubmitting;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="space-y-6">
        {/* Mobile-Optimized Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Submit Post</h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Launch your LinkedIn post to the engagement queue
                {isOfflineMode && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                    Offline Mode
                  </Badge>
                )}
              </p>
            </div>
          </div>

          {/* Points Balance - Mobile First */}
          <div className="flex sm:flex-col gap-3 sm:gap-2 text-center sm:text-right">
            <div className="flex-1 sm:flex-none">
              <div className="text-xl sm:text-2xl font-bold">{currentPoints}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Points Balance</div>
            </div>
            <div className="flex-1 sm:flex-none">
              <div className="text-lg sm:text-xl font-semibold">{activeSubmissions.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Posts</div>
            </div>
          </div>
        </div>

        {/* Points Warning */}
        {currentPoints < 5 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need at least 5 points to submit a post. <strong>Engage with others in the Queue to earn points!</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* URL Validation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ExternalLink className="h-5 w-5" />
              LinkedIn Post URL
              {urlValidated && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="url" 
                required 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/..." 
                disabled={isSubmitting}
                className={`text-sm ${urlValidated ? 'border-green-500' : ''}`}
              />
              <div className="flex items-center gap-2 text-sm">
                {isValidatingUrl && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    Validating URL...
                  </div>
                )}
                {urlValidated && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Valid LinkedIn post detected
                  </div>
                )}
              </div>
            </div>

            {urlValidated && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">Post Preview Ready</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your LinkedIn post has been validated and is ready for campaign setup.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Campaign Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Industry Targeting */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    Target Industry
                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                  </Label>
                  <Select value={industry} onValueChange={setIndustry} disabled={isSubmitting}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind} className="text-sm">
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Engagement Goal */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    Engagement Goal: <span className="text-primary font-bold">{likes[0]} likes</span>
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={likes}
                      onValueChange={setLikes}
                      max={100}
                      min={5}
                      step={5}
                      className="w-full"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>5 likes</span>
                      <span>100+ likes</span>
                    </div>
                  </div>
                </div>

                {/* Comment Strategy */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <MessageCircle className="h-4 w-4" />
                    Comment Strategy
                  </Label>
                  <RadioGroup value={commentType} onValueChange={setCommentType} disabled={isSubmitting} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none" className="text-sm">Likes only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="template" id="template" />
                      <Label htmlFor="template" className="text-sm">Professional templates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="text-sm">Custom message</Label>
                    </div>
                  </RadioGroup>

                  {commentType === "template" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Comment Template</Label>
                      <Select value={selectedTemplateIndex} onValueChange={setSelectedTemplateIndex}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMENT_TEMPLATES.map((template, i) => (
                            <SelectItem key={i} value={i.toString()} className="text-sm">
                              {template.length > 50 ? template.substring(0, 50) + "..." : template}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {commentType === "custom" && (
                    <Textarea
                      placeholder="Write your custom comment..."
                      value={customComment}
                      onChange={(e) => setCustomComment(e.target.value)}
                      className="min-h-20 text-sm"
                      disabled={isSubmitting}
                    />
                  )}
                </div>

                {/* Delivery Speed */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4" />
                    Delivery Speed
                  </Label>
                  <RadioGroup value={deliverySpeed} onValueChange={setDeliverySpeed} disabled={isSubmitting} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal" className="flex items-center justify-between w-full text-sm">
                        <span>Normal (24-48h)</span>
                        <Badge variant="outline" className="text-xs">Free</Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="fast" />
                      <Label htmlFor="fast" className="flex items-center justify-between w-full text-sm">
                        <span>Fast (6-12h)</span>
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="viral" id="viral" />
                      <Label htmlFor="viral" className="flex items-center justify-between w-full text-sm">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Viral Push (1-3h)
                        </span>
                        <Badge className="text-xs">Premium</Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Launching Campaign...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Launch Campaign (-5 points)
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview & Active Submissions */}
          <div className="space-y-6">
            {/* Campaign Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Campaign Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Target Industry</span>
                    <Badge variant="outline">{industry}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Engagement Goal</span>
                    <Badge variant="default">{preview.targetLikes} likes</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Est. Comments</span>
                    <Badge variant="secondary">{preview.estimatedComments}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Completion Time</span>
                    <Badge variant="outline">{preview.completionTime}</Badge>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Expected Results</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p>• {preview.estimatedViews} estimated views</p>
                    <p>• {preview.engagementRate}% engagement rate</p>
                    <p>• {Math.floor(preview.targetLikes * 0.3)} profile visits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Submissions */}
            {activeSubmissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Your Active Posts ({activeSubmissions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeSubmissions.slice(0, 3).map((submission, index) => (
                    <div key={submission.id || index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">LinkedIn Post</h4>
                          <p className="text-xs text-muted-foreground">
                            {submission.industry || submission.settings?.industry || "Technology"} • 
                            {submission.target_likes || submission.settings?.targetLikes || 25} likes goal
                          </p>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {submission.status || "Active"}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={
                            submission.current_likes ? 
                              (submission.current_likes / submission.target_likes * 100) :
                              Math.random() * 100
                          } 
                          className="w-full h-2" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {submission.current_likes || Math.floor(Math.random() * (submission.target_likes || 25))} / {submission.target_likes || submission.settings?.targetLikes || 25} likes
                        </p>
                      </div>
                    </div>
                  ))}

                  {activeSubmissions.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{activeSubmissions.length - 3} more active posts
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <p className="text-muted-foreground">Your post is added to the engagement queue</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <p className="text-muted-foreground">Pod members engage with your content</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <p className="text-muted-foreground">You receive notifications as engagement grows</p>
                </div>

                {isOfflineMode && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      🧪 Running in {isOfflineAdmin ? 'offline admin' : 'demo'} mode - all submissions are simulated for testing purposes.
                    </p>
                  </div>
                )}

                {!isOfflineMode && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      🚀 Connected to production database - your submissions will be processed by real users!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}