import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type PostSubmission = Tables['post_submissions']['Row'];
type Engagement = Tables['engagements']['Row'];
type Achievement = Tables['achievements']['Row'];
type UserAchievement = Tables['user_achievements']['Row'];
type PointHistory = Tables['point_history']['Row'];
type EngagementPod = Tables['engagement_pods']['Row'];

export class SupabaseService {
  // Profile Management
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  static async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();
    if (error) {
      console.error('Error upserting profile:', error);
      return null;
    }
    return data;
  }

  static async updatePoints(userId: string, pointsDelta: number, action: string, description?: string): Promise<boolean> {
    try {
      // Get current profile
      const profile = await this.getProfile(userId);
      if (!profile) return false;

      const newTotalPoints = profile.total_points + pointsDelta;
      // Update profile points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_points: newTotalPoints,
          weekly_points: profile.weekly_points + Math.max(0, pointsDelta),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile points:', profileError);
        return false;
      }

      // Add to point history
      const { error: historyError } = await supabase
        .from('point_history')
        .insert({
          user_id: userId,
          points: pointsDelta,
          action,
          description
        });

      if (historyError) {
        console.error('Error adding point history:', historyError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePoints:', error);
      return false;
    }
  }

  // Pod Management
  static async getDefaultPod(): Promise<EngagementPod | null> {
    const { data, error } = await supabase
      .from('engagement_pods')
      .select('*')
      .eq('is_public', true)
      .limit(1)
      .single();
    if (error) {
      console.error('Error fetching default pod:', error);
      return null;
    }
    return data;
  }

  static async joinPod(userId: string, podId: string): Promise<boolean> {
    const { error } = await supabase
      .from('pod_members')
      .insert({
        user_id: userId,
        pod_id: podId,
        status: 'active',
        role: 'member'
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Error joining pod:', error);
      return false;
    }

    return true;
  }

  // Post Submissions
  static async submitPost(submission: {
    userId: string;
    podId: string;
    postUrl: string;
    title?: string;
    industry: string;
    targetLikes: number;
    targetComments: number;
    deliverySpeed: string;
    commentStrategy: string;
    customComment?: string;
  }): Promise<PostSubmission | null> {
    const { data, error } = await supabase
      .from('post_submissions')
      .insert({
        user_id: submission.userId,
        pod_id: submission.podId,
        post_url: submission.postUrl,
        title: submission.title,
        industry: submission.industry,
        target_likes: submission.targetLikes,
        target_comments: submission.targetComments,
        delivery_speed: submission.deliverySpeed,
        comment_strategy: submission.commentStrategy,
        custom_comment: submission.customComment,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting post:', error);
      return null;
    }

    return data;
  }

  static async getActiveSubmissions(userId: string): Promise<PostSubmission[]> {
    const { data, error } = await supabase
      .from('post_submissions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }

    return data || [];
  }

  static async getQueuePosts(userId: string): Promise<PostSubmission[]> {
    // Get user's pods
    const { data: pods } = await supabase
      .from('pod_members')
      .select('pod_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!pods || pods.length === 0) return [];

    const podIds = pods.map(p => p.pod_id);

    const { data, error } = await supabase
      .from('post_submissions')
      .select('*, profiles(full_name, email)')
      .in('pod_id', podIds)
      .neq('user_id', userId) // Don't show user's own posts
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching queue posts:', error);
      return [];
    }

    return data || [];
  }

  // Engagements
  static async createEngagement(engagement: {
    userId: string;
    podId: string;
    postId: string;
    type: 'like' | 'comment';
    commentText?: string;
  }): Promise<boolean> {
    try {
      const points = engagement.type === 'like' ? 1 : 3;

      // Create engagement record
      const { error: engagementError } = await supabase
        .from('engagements')
        .insert({
          user_id: engagement.userId,
          pod_id: engagement.podId,
          post_id: engagement.postId,
          type: engagement.type,
          comment_text: engagement.commentText,
          points_earned: points
        });

      if (engagementError && engagementError.code !== '23505') {
        console.error('Error creating engagement:', engagementError);
        return false;
      }

      // Update user points
      await this.updatePoints(
        engagement.userId, 
        points, 
        `${engagement.type === 'like' ? 'Liked' : 'Commented on'} post`,
        `Earned ${points} points for ${engagement.type}`
      );

      // Get current post to update counts
      const { data: currentPost } = await supabase
        .from('post_submissions')
        .select('current_likes, current_comments, total_engagements')
        .eq('id', engagement.postId)
        .single();

      if (currentPost) {
        const { error: postError } = await supabase
          .from('post_submissions')
          .update({
            current_likes: engagement.type === 'like' ? 
              currentPost.current_likes + 1 : currentPost.current_likes,
            current_comments: engagement.type === 'comment' ? 
              currentPost.current_comments + 1 : currentPost.current_comments,
            total_engagements: currentPost.total_engagements + 1
          })
          .eq('id', engagement.postId);

        if (postError) {
          console.error('Error updating post counts:', postError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in createEngagement:', error);
      return false;
    }
  }

  static async getUserEngagements(userId: string, date?: string): Promise<Engagement[]> {
    let query = supabase
      .from('engagements')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user engagements:', error);
      return [];
    }

    return data || [];
  }

  // Achievements
  static async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data || [];
  }

  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  }

  static async checkAndUnlockAchievements(userId: string): Promise<void> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return;

      const achievements = await this.getAchievements();
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = userAchievements.filter(ua => ua.is_unlocked).map(ua => ua.achievement_id);

      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.requirement_type) {
          case 'points_total':
            shouldUnlock = profile.total_points >= achievement.requirement_value;
            break;
          case 'engagement_count':
            const engagements = await this.getUserEngagements(userId);
            shouldUnlock = engagements.length >= achievement.requirement_value;
            break;
          case 'streak_days':
            shouldUnlock = profile.current_streak >= achievement.requirement_value;
            break;
        }

        if (shouldUnlock) {
          // Unlock achievement
          await supabase
            .from('user_achievements')
            .upsert({
              user_id: userId,
              achievement_id: achievement.id,
              is_unlocked: true,
              unlocked_at: new Date().toISOString()
            });

          // Award points
          await this.updatePoints(
            userId,
            achievement.points,
            'Achievement unlocked',
            `Unlocked ${achievement.name} achievement`
          );
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Point History
  static async getPointHistory(userId: string, limit = 50): Promise<PointHistory[]> {
    const { data, error } = await supabase
      .from('point_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching point history:', error);
      return [];
    }

    return data || [];
  }

  // Leaderboard
  static async getLeaderboard(limit = 10): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  }

  // Analytics
  static async getUserAnalytics(userId: string): Promise<{
    totalEngagements: number;
    totalSubmissions: number;
    averageEngagementRate: number;
    topIndustry: string;
  }> {
    try {
      const [engagements, submissions] = await Promise.all([
        this.getUserEngagements(userId),
        this.getActiveSubmissions(userId)
      ]);

      const industries = submissions.map(s => s.industry).filter(Boolean);
      const topIndustry = industries.length > 0 ? 
        industries.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        ) : 'Technology';

      return {
        totalEngagements: engagements.length,
        totalSubmissions: submissions.length,
        averageEngagementRate: submissions.length > 0 ? 
          submissions.reduce((sum, s) => sum + ((s.current_likes + s.current_comments) / Math.max(s.target_likes + s.target_comments, 1)), 0) / submissions.length * 100 : 0,
        topIndustry
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return {
        totalEngagements: 0,
        totalSubmissions: 0,
        averageEngagementRate: 0,
        topIndustry: 'Technology'
      };
    }
  }
}

export default SupabaseService;