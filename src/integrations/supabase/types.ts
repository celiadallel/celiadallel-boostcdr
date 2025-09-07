export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          total_points: number;
          current_streak: number;
          last_activity_date: string;
          weekly_points: number;
          weekly_reset_date: string;
          plan: string;
          daily_submission_limit: number;
          daily_submissions_used: number;
          submissions_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          total_points?: number;
          current_streak?: number;
          last_activity_date?: string;
          weekly_points?: number;
          weekly_reset_date?: string;
          plan?: string;
          daily_submission_limit?: number;
          daily_submissions_used?: number;
          submissions_reset_date?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          total_points?: number;
          current_streak?: number;
          last_activity_date?: string;
          weekly_points?: number;
          weekly_reset_date?: string;
          plan?: string;
          daily_submission_limit?: number;
          daily_submissions_used?: number;
          submissions_reset_date?: string;
          updated_at?: string;
        };
      };
      engagement_pods: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          industry: string | null;
          is_public: boolean;
          max_members: number;
          min_engagement_score: number;
          daily_post_limit: number;
          requires_approval: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          industry?: string | null;
          is_public?: boolean;
          max_members?: number;
          min_engagement_score?: number;
          daily_post_limit?: number;
          requires_approval?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          industry?: string | null;
          is_public?: boolean;
          max_members?: number;
          min_engagement_score?: number;
          daily_post_limit?: number;
          requires_approval?: boolean;
          updated_at?: string;
        };
      };
      post_submissions: {
        Row: {
          id: string;
          pod_id: string;
          user_id: string;
          post_url: string;
          title: string | null;
          description: string | null;
          industry: string | null;
          target_likes: number;
          target_comments: number;
          delivery_speed: string;
          comment_strategy: string;
          custom_comment: string | null;
          status: string;
          current_likes: number;
          current_comments: number;
          total_engagements: number;
          submitted_at: string;
          activated_at: string | null;
          completed_at: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          pod_id: string;
          user_id: string;
          post_url: string;
          title?: string | null;
          description?: string | null;
          industry?: string | null;
          target_likes?: number;
          target_comments?: number;
          delivery_speed?: string;
          comment_strategy?: string;
          custom_comment?: string | null;
          status?: string;
          current_likes?: number;
          current_comments?: number;
          total_engagements?: number;
        };
        Update: {
          title?: string | null;
          description?: string | null;
          industry?: string | null;
          target_likes?: number;
          target_comments?: number;
          delivery_speed?: string;
          comment_strategy?: string;
          custom_comment?: string | null;
          status?: string;
          current_likes?: number;
          current_comments?: number;
          total_engagements?: number;
          activated_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      engagements: {
        Row: {
          id: string;
          pod_id: string;
          post_id: string;
          user_id: string;
          type: string;
          comment_text: string | null;
          points_earned: number;
          status: string;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          pod_id: string;
          post_id: string;
          user_id: string;
          type: string;
          comment_text?: string | null;
          points_earned?: number;
          status?: string;
        };
        Update: {
          comment_text?: string | null;
          points_earned?: number;
          status?: string;
          verified_at?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          points: number;
          rarity: string;
          requirement_type: string | null;
          requirement_value: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          icon: string;
          points?: number;
          rarity?: string;
          requirement_type?: string | null;
          requirement_value?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          icon?: string;
          points?: number;
          rarity?: string;
          requirement_type?: string | null;
          requirement_value?: number;
          is_active?: boolean;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          progress_value: number;
          is_unlocked: boolean;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          progress_value?: number;
          is_unlocked?: boolean;
          unlocked_at?: string | null;
        };
        Update: {
          progress_value?: number;
          is_unlocked?: boolean;
          unlocked_at?: string | null;
        };
      };
      point_history: {
        Row: {
          id: string;
          user_id: string;
          points: number;
          action: string;
          description: string | null;
          related_post_id: string | null;
          related_engagement_id: string | null;
          related_achievement_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          points: number;
          action: string;
          description?: string | null;
          related_post_id?: string | null;
          related_engagement_id?: string | null;
          related_achievement_id?: string | null;
        };
        Update: {
          points?: number;
          action?: string;
          description?: string | null;
        };
      };
    };
  };
}