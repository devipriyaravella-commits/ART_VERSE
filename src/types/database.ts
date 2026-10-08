export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'artist' | 'explorer';
export type AvailabilityStatus = 'available' | 'busy' | 'not_available';
export type AIMatchType = 'artist' | 'opportunity' | 'collaboration';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // UUID references auth.users.id
          full_name: string;
          username: string | null;
          role: UserRole;
          bio: string | null;
          city: string | null;
          country: string | null;
          primary_medium: string | null;
          skills: string[] | null;
          interests: string[] | null;
          avatar_url: string | null;
          cover_url: string | null;
          website_url: string | null;
          availability_status: AvailabilityStatus | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          username?: string | null;
          role: UserRole;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          primary_medium?: string | null;
          skills?: string[] | null;
          interests?: string[] | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          website_url?: string | null;
          availability_status?: AvailabilityStatus | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          username?: string | null;
          role?: UserRole;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          primary_medium?: string | null;
          skills?: string[] | null;
          interests?: string[] | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          website_url?: string | null;
          availability_status?: AvailabilityStatus | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      artworks: {
        Row: {
          id: string;
          artist_id: string; // UUID references profiles.id
          title: string;
          description: string | null;
          medium: string | null;
          category: string | null;
          image_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          title: string;
          description?: string | null;
          medium?: string | null;
          category?: string | null;
          image_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          title?: string;
          description?: string | null;
          medium?: string | null;
          category?: string | null;
          image_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          organization: string;
          description: string | null;
          type: string | null;
          location: string | null;
          category: string | null;
          deadline: string | null;
          application_url: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          organization: string;
          description?: string | null;
          type?: string | null;
          location?: string | null;
          category?: string | null;
          deadline?: string | null;
          application_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          organization?: string;
          description?: string | null;
          type?: string | null;
          location?: string | null;
          category?: string | null;
          deadline?: string | null;
          application_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string; // UUID references profiles.id
          artist_id: string; // UUID references profiles.id
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          artist_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          artist_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          user_id: string; // UUID references profiles.id
          artwork_id: string; // UUID references artworks.id
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artwork_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          artwork_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      saves: {
        Row: {
          id: string;
          user_id: string; // UUID references profiles.id
          artwork_id: string | null;
          artist_id: string | null;
          opportunity_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artwork_id?: string | null;
          artist_id?: string | null;
          opportunity_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          artwork_id?: string | null;
          artist_id?: string | null;
          opportunity_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string; // UUID references profiles.id
          artwork_id: string; // UUID references artworks.id
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artwork_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          artwork_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collaboration_requests: {
        Row: {
          id: string;
          sender_id: string; // UUID references profiles.id
          receiver_id: string; // UUID references profiles.id
          artwork_id: string | null;
          opportunity_id: string | null;
          message: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          artwork_id?: string | null;
          opportunity_id?: string | null;
          message: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          artwork_id?: string | null;
          opportunity_id?: string | null;
          message?: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string; // UUID references profiles.id
          type: string | null;
          title: string;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string | null;
          title: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string | null;
          title?: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_matches: {
        Row: {
          id: string;
          user_id: string; // UUID references profiles.id
          matched_profile_id: string | null; // UUID references profiles.id
          matched_opportunity_id: string | null; // UUID references opportunities.id
          match_type: AIMatchType;
          match_percentage: number | null;
          match_reason: string | null;
          relevant_skills: string[] | null;
          portfolio_alignment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          matched_profile_id?: string | null;
          matched_opportunity_id?: string | null;
          match_type: AIMatchType;
          match_percentage?: number | null;
          match_reason?: string | null;
          relevant_skills?: string[] | null;
          portfolio_alignment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          matched_profile_id?: string | null;
          matched_opportunity_id?: string | null;
          match_type?: AIMatchType;
          match_percentage?: number | null;
          match_reason?: string | null;
          relevant_skills?: string[] | null;
          portfolio_alignment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      availability_status: AvailabilityStatus;
      ai_match_type: AIMatchType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
