import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import SupabaseService from "@/services/supabaseService";
import { toast } from "sonner";

interface UserData {
  points: number;
  submissions: any[];
  engagements: any[];
  achievements: any[];
  pointHistory: any[];
  leaderboard: any[];
  isLoading: boolean;
  isOfflineMode: boolean;
}

export function useSupabaseData(): UserData & {
  refreshData: () => Promise<void>;
  submitPost: (data: any) => Promise<boolean>;
  createEngagement: (data: any) => Promise<boolean>;
  updatePoints: (points: number, action: string) => Promise<boolean>;
} {
  const { user } = useAuth();
  const [data, setData] = useState<UserData>({
    points: 0,
    submissions: [],
    engagements: [],
    achievements: [],
    pointHistory: [],
    leaderboard: [],
    isLoading: true,
    isOfflineMode: false
  });

  const isOfflineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";

  // Initialize user profile in Supabase with error handling
  const initializeSupabaseProfile = async () => {
    if (!user || isOfflineAdmin) return true;

    try {
      // Get or create profile
      let profile = await SupabaseService.getProfile(user.id);
      if (!profile) {
        profile = await SupabaseService.upsertProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          is_admin: user.user_metadata?.is_admin || false
        });
      }

      // Auto-join default pod if available
      try {
        const defaultPod = await SupabaseService.getDefaultPod();
        if (defaultPod && profile) {
          await SupabaseService.joinPod(user.id, defaultPod.id);
        }
      } catch (podError) {
        console.log('Pod joining skipped (pods may not be ready yet):', podError);
      }

      return true;
    } catch (error) {
      console.error('Error initializing Supabase profile:', error);
      return false;
    }
  };

  // Load data from appropriate source with comprehensive error handling
  const loadData = async () => {
    if (!user) return;

    setData(prev => ({ ...prev, isLoading: true }));

    try {
      if (isOfflineAdmin) {
        // Load from localStorage (offline mode)
        const points = parseInt(localStorage.getItem("user-points") || "42", 10);
        const submissions = JSON.parse(localStorage.getItem("demo-submissions") || "[]");
        setData(prev => ({
          ...prev,
          points,
          submissions,
          engagements: [], // Mock data for offline
          achievements: [
            { id: "first_like", name: "First Like", unlocked: true, points: 1 },
            { id: "first_comment", name: "Conversationalist", unlocked: true, points: 5 }
          ],
          pointHistory: [
            { id: 1, action: "Liked post", points: 1, timestamp: new Date(Date.now() - 1000 * 60 * 30) },
            { id: 2, action: "Commented on post", points: 3, timestamp: new Date(Date.now() - 1000 * 60 * 60) }
          ],
          leaderboard: [
            { rank: 1, name: "You", points, trend: "+5" },
            { rank: 2, name: "Jane Smith", points: 38, trend: "+2" }
          ],
          isOfflineMode: true,
          isLoading: false
        }));
      } else {
        // Load from Supabase (production mode) with error handling
        const profileInitialized = await initializeSupabaseProfile();

        if (!profileInitialized) {
          // Fallback to offline mode if Supabase initialization fails
          console.log('Falling back to offline mode due to Supabase connection issues');
          setData(prev => ({
            ...prev,
            points: 42,
            submissions: [],
            engagements: [],
            achievements: [],
            pointHistory: [],
            leaderboard: [],
            isOfflineMode: true,
            isLoading: false
          }));
          return;
        }

        try {
          const [
            profile,
            submissions,
            engagements,
            achievements,
            pointHistory,
            leaderboard
          ] = await Promise.allSettled([
            SupabaseService.getProfile(user.id),
            SupabaseService.getActiveSubmissions(user.id),
            SupabaseService.getUserEngagements(user.id),
            SupabaseService.getUserAchievements(user.id),
            SupabaseService.getPointHistory(user.id),
            SupabaseService.getLeaderboard()
          ]);

          setData(prev => ({
            ...prev,
            points: profile.status === 'fulfilled' && profile.value?.total_points || 0,
            submissions: submissions.status === 'fulfilled' ? submissions.value || [] : [],
            engagements: engagements.status === 'fulfilled' ? engagements.value || [] : [],
            achievements: achievements.status === 'fulfilled' ? achievements.value || [] : [],
            pointHistory: pointHistory.status === 'fulfilled' ? pointHistory.value || [] : [],
            leaderboard: leaderboard.status === 'fulfilled' ? leaderboard.value || [] : [],
            isOfflineMode: false,
            isLoading: false
          }));

        } catch (supabaseError) {
          console.error('Supabase data loading failed:', supabaseError);
          // Fallback to basic online mode with empty data
          setData(prev => ({
            ...prev,
            points: 0,
            submissions: [],
            engagements: [],
            achievements: [],
            pointHistory: [],
            leaderboard: [],
            isOfflineMode: false,
            isLoading: false
          }));
          toast.info("Connected to production database. Some features may be limited initially.");
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Ultimate fallback
      setData(prev => ({
        ...prev,
        points: isOfflineAdmin ? parseInt(localStorage.getItem("user-points") || "42", 10) : 0,
        submissions: isOfflineAdmin ? JSON.parse(localStorage.getItem("demo-submissions") || "[]") : [],
        engagements: [],
        achievements: [],
        pointHistory: [],
        leaderboard: [],
        isOfflineMode: isOfflineAdmin,
        isLoading: false
      }));

      if (!isOfflineAdmin) {
        toast.error("Connection issues detected. Some features may be limited.");
      }
    }
  };

  // Refresh data
  const refreshData = async () => {
    await loadData();
  };

  // Submit post with error handling
  const submitPost = async (postData: {
    url: string;
    title?: string;
    industry: string;
    targetLikes: number;
    targetComments: number;
    deliverySpeed: string;
    commentStrategy: string;
    customComment?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      if (isOfflineAdmin || data.isOfflineMode) {
        // Offline mode - use localStorage
        const submission = {
          id: Date.now(),
          ...postData,
          submittedAt: new Date().toISOString(),
          status: 'active'
        };

        const submissions = JSON.parse(localStorage.getItem("demo-submissions") || "[]");
        submissions.push(submission);
        localStorage.setItem("demo-submissions", JSON.stringify(submissions));

        // Update points
        const currentPoints = parseInt(localStorage.getItem("user-points") || "42", 10);
        const newPoints = currentPoints - 5;
        localStorage.setItem("user-points", newPoints.toString());

        await refreshData();
        return true;
      } else {
        // Production mode - use Supabase with fallback
        try {
          const defaultPod = await SupabaseService.getDefaultPod();
          if (!defaultPod) {
            toast.error("Service temporarily unavailable. Please try again later.");
            return false;
          }

          // Deduct points first
          const success = await SupabaseService.updatePoints(user.id, -5, "Post submission", "Submitted post to engagement queue");
          if (!success) {
            toast.error("Unable to process submission. Please try again.");
            return false;
          }

          // Submit post
          const submission = await SupabaseService.submitPost({
            userId: user.id,
            podId: defaultPod.id,
            postUrl: postData.url,
            title: postData.title,
            industry: postData.industry,
            targetLikes: postData.targetLikes,
            targetComments: postData.targetComments,
            deliverySpeed: postData.deliverySpeed,
            commentStrategy: postData.commentStrategy,
            customComment: postData.customComment
          });

          if (submission) {
            await refreshData();
            return true;
          }
          return false;
        } catch (supabaseError) {
          console.error('Supabase submission failed:', supabaseError);
          toast.error("Service temporarily unavailable. Please try again later.");
          return false;
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error("Failed to submit post. Please try again.");
      return false;
    }
  };

  // Create engagement with error handling
  const createEngagement = async (engagementData: {
    postId: string;
    type: 'like' | 'comment';
    commentText?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      if (isOfflineAdmin || data.isOfflineMode) {
        // Offline mode - simulate engagement
        const points = engagementData.type === 'like' ? 1 : 3;
        const currentPoints = parseInt(localStorage.getItem("user-points") || "42", 10);
        const newPoints = currentPoints + points;
        localStorage.setItem("user-points", newPoints.toString());

        await refreshData();
        return true;
      } else {
        // Production mode - use Supabase with fallback
        try {
          const defaultPod = await SupabaseService.getDefaultPod();
          if (!defaultPod) {
            // Fallback: just update points locally for now
            const points = engagementData.type === 'like' ? 1 : 3;
            await SupabaseService.updatePoints(user.id, points, `${engagementData.type} engagement`, `Earned ${points} points for ${engagementData.type}`);
            await refreshData();
            return true;
          }

          const success = await SupabaseService.createEngagement({
            userId: user.id,
            podId: defaultPod.id,
            postId: engagementData.postId,
            type: engagementData.type,
            commentText: engagementData.commentText
          });

          if (success) {
            await refreshData();
            // Check for achievements
            try {
              await SupabaseService.checkAndUnlockAchievements(user.id);
            } catch (achievementError) {
              console.log('Achievement check skipped:', achievementError);
            }
            return true;
          }
          return false;
        } catch (supabaseError) {
          console.error('Supabase engagement failed:', supabaseError);
          // Fallback: still award points
          const points = engagementData.type === 'like' ? 1 : 3;
          try {
            await SupabaseService.updatePoints(user.id, points, `${engagementData.type} engagement`, `Earned ${points} points for ${engagementData.type}`);
            await refreshData();
            return true;
          } catch (pointsError) {
            console.error('Points update also failed:', pointsError);
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Error creating engagement:', error);
      toast.error("Failed to create engagement. Please try again.");
      return false;
    }
  };

  // Update points (for admin testing) with error handling
  const updatePoints = async (points: number, action: string): Promise<boolean> => {
    if (!user) return false;

    try {
      if (isOfflineAdmin || data.isOfflineMode) {
        // Offline mode
        const currentPoints = parseInt(localStorage.getItem("user-points") || "42", 10);
        const newPoints = currentPoints + points;
        localStorage.setItem("user-points", newPoints.toString());

        await refreshData();
        return true;
      } else {
        // Production mode
        try {
          const success = await SupabaseService.updatePoints(user.id, points, action);
          if (success) {
            await refreshData();
            return true;
          }
          return false;
        } catch (supabaseError) {
          console.error('Supabase points update failed:', supabaseError);
          return false;
        }
      }
    } catch (error) {
      console.error('Error updating points:', error);
      return false;
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, isOfflineAdmin]);

  return {
    ...data,
    refreshData,
    submitPost,
    createEngagement,
    updatePoints
  };
}

export default useSupabaseData;