import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';
import { Database } from '../types/database';
import { Artist, Artwork, Opportunity, Comment, ArtCategory, OpportunityCategory } from '../types';
import { storageService } from './storageService';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ArtworkRow = Database['public']['Tables']['artworks']['Row'];
export type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];
export type CollaborationRow = Database['public']['Tables']['collaboration_requests']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/**
 * Friendly Error Mapping per Auth Specification
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';

  const rawMsg = typeof error === 'string'
    ? error
    : (error.message || error.error_description || error.error || '');
  const msg = rawMsg.toLowerCase();

  if (msg.includes('supabase is not configured') || msg.includes('supabase_not_configured')) {
    return 'Supabase authentication is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('unique constraint')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
  }
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return 'Password must be at least 6 characters in length.';
  }
  if (msg.includes('token has expired') || msg.includes('expired') || msg.includes('otp_expired')) {
    return 'The verification code or link has expired. Please request a new one.';
  }
  if (msg.includes('invalid token') || msg.includes('invalid otp')) {
    return 'The verification code is incorrect. Please check the code and try again.';
  }
  if (msg.includes('signups not allowed for otp') || msg.includes('user not found') || msg.includes('otp disabled for signups') || msg.includes('signup requires')) {
    return 'No account was found with this email. Please sign up to create your account.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Unable to reach the authentication service. Please check your internet connection.';
  }

  return rawMsg || 'Authentication error. Please try again.';
}

/**
 * Domain Model Mappers
 */
export function mapProfileToArtist(profile: ProfileRow, followersCount = 28): Artist {
  const city = profile.city || '';
  const country = profile.country || '';
  const loc = city && country ? `${city}, ${country}` : city || country || 'Global';
  const category = (profile.primary_medium as ArtCategory) || 'Visual Art';

  return {
    id: profile.id,
    name: profile.full_name || profile.username || 'Artist',
    email: `${profile.username || 'creator'}@artverse.org`,
    role: (profile.role as any) || 'artist',
    title: profile.primary_medium ? `${profile.primary_medium} Artist` : 'Contemporary Artist',
    location: loc,
    region: country || 'International',
    country: country || 'Global',
    category: category,
    experience: 'Emerging',
    availability: profile.availability_status === 'busy' ? 'Busy' : 'Available',
    bio: profile.bio || 'Visual storyteller creating on ARTVERSE.',
    statement: profile.bio || '',
    skills: profile.skills && profile.skills.length > 0 ? profile.skills : ['Contemporary', 'Visual Arts'],
    tags: profile.interests && profile.interests.length > 0 ? profile.interests : ['Creative', 'Design'],
    achievements: ['Verified ARTVERSE Creator'],
    socialLinks: {
      website: profile.website_url || undefined
    },
    avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: profile.cover_url || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
    followersCount: followersCount,
    profileViews: 140,
    artworkViews: 420,
    viewsGrowth: '+28%',
    engagementGrowth: '+18%',
    isRising: true,
    isFeatured: true,
    isTrending: false,
    createdAt: profile.created_at ? profile.created_at.split('T')[0] : '2026-01-01'
  };
}

export function mapArtworkRowToArtwork(
  row: ArtworkRow,
  artist?: ProfileRow | null,
  stats?: { likesCount?: number; savesCount?: number }
): Artwork {
  const artistName = artist?.full_name || artist?.username || 'ARTVERSE Creator';
  const artistAvatar = artist?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const city = artist?.city || '';
  const country = artist?.country || '';
  const loc = city && country ? `${city}, ${country}` : city || country || 'Global';

  return {
    id: row.id,
    title: row.title,
    artistId: row.artist_id,
    artistName: artistName,
    artistAvatar: artistAvatar,
    artistLocation: loc,
    imageUrl: row.image_url,
    description: row.description || '',
    category: (row.category as ArtCategory) || 'Visual Art',
    medium: row.medium || 'Mixed Media',
    tags: ['Contemporary', 'Original', row.category || 'Visual Art'],
    likesCount: stats?.likesCount || 0,
    savesCount: stats?.savesCount || 0,
    viewsCount: 1,
    commentsCount: 0,
    isFeatured: false,
    createdAt: row.created_at ? row.created_at.split('T')[0] : '2026-01-01'
  };
}

export function mapOpportunityRowToOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    orgLogo: row.image_url || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=120&q=80',
    category: (row.type as OpportunityCategory) || 'Grants',
    location: row.location || 'Global',
    mode: row.location?.toLowerCase().includes('online') ? 'Online' : 'Hybrid',
    deadline: row.deadline ? row.deadline.split('T')[0] : '2026-12-31',
    compensation: 'Grant Award',
    prize: 'International Exhibition',
    description: row.description || '',
    requirements: ['Portfolio submission', 'Original works', 'Artist statement'],
    eligibility: 'Open to creators worldwide',
    tags: ['International', 'Curated', row.category || 'Open Call'],
    applyUrl: row.application_url || 'https://artverse.org/apply',
    featured: true,
    createdAt: row.created_at ? row.created_at.split('T')[0] : '2026-01-01'
  };
}

export const supabaseService = {
  /**
   * Check connection to Supabase
   */
  async pingConnection() {
    return checkSupabaseConnection();
  },

  /**
   * Expose storage service
   */
  storage: storageService,

  /**
   * Helper to map auth error to friendly message
   */
  getFriendlyErrorMessage: getFriendlyAuthErrorMessage,

  /**
   * Supabase Auth: Sign up with Email and Password
   * Automatically creates user and corresponding public.profiles entry (auth.users.id = profiles.id)
   */
  async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: 'artist' | 'explorer';
    location?: string;
    primaryMedium?: string;
  }) {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    const { email, password, fullName, role, location, primaryMedium } = params;
    const parts = (location || '').split(',').map((p) => p.trim());
    const city = parts[0] || 'Global';
    const country = parts[1] || 'Global';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          city,
          country,
          primary_medium: primaryMedium || (role === 'artist' ? 'Visual Art' : undefined)
        }
      }
    });

    if (error) {
      throw error;
    }

    // Ensure profiles record is present in case trigger is disabled or delayed
    if (data.user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            username: email.split('@')[0] + '_' + data.user.id.slice(0, 4),
            role: role,
            city,
            country,
            primary_medium: primaryMedium || (role === 'artist' ? 'Visual Art' : null)
          }, { onConflict: 'id' });
      } catch (profileErr: any) {
        console.warn('[ARTVERSE] Profile sync notice:', profileErr?.message || profileErr);
      }
    }

    return { success: true, data };
  },

  /**
   * Supabase Auth: Sign in with Email and Password
   */
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  },

  /**
   * Supabase Auth: Send real email OTP (passwordless)
   * Enforces shouldCreateUser: false per ARTVERSE specification.
   */
  async signInWithOtp(email: string, shouldCreateUser = false) {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      };
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  },

  /**
   * Supabase Auth: Verify real email OTP token
   */
  async verifyOtp(email: string, token: string) {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  },

  /**
   * Supabase Auth: Sign in with Google OAuth
   * - prompt:'select_account' ensures user always picks/verifies their Google account
   * - login_hint pre-fills email if provided
   */
  async signInWithGoogle(emailHint?: string) {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/home',
        queryParams: {
          prompt: 'select_account',
          ...(emailHint ? { login_hint: emailHint } : {})
        }
      }
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  },

  /**
   * Supabase Auth: Send password reset email
   */
  async resetPassword(email: string) {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  },

  /**
   * Supabase Auth: Update user password (e.g. after recovery link)
   */
  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  },

  /**
   * Supabase Auth: Sign out
   */
  async signOut() {
    if (!isSupabaseConfigured()) return { success: true };
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  /**
   * Get the current authenticated Supabase user session
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  /**
   * Get current user's profile row from public.profiles using explicit ID or auth.uid()
   */
  async getCurrentProfile(explicitUserId?: string): Promise<ProfileRow | null> {
    if (!isSupabaseConfigured()) return null;
    let uid = explicitUserId;
    if (!uid) {
      const user = await this.getCurrentUser();
      uid = user?.id;
    }
    if (!uid) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching current profile:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Fetch all registered artists as raw ProfileRow
   */
  async getArtists(): Promise<ProfileRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'artist')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching artists from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch all registered artists mapped to Artist domain models
   */
  async getArtistsWithMetrics(): Promise<Artist[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const profiles = await this.getArtists();
      if (!profiles.length) return [];

      // Fetch follow counts
      const { data: followRows } = await supabase.from('follows').select('artist_id');
      const followCounts: Record<string, number> = {};
      if (followRows) {
        followRows.forEach((r) => {
          followCounts[r.artist_id] = (followCounts[r.artist_id] || 0) + 1;
        });
      }

      return profiles.map((p) => mapProfileToArtist(p, followCounts[p.id] || 12));
    } catch (err) {
      console.warn('Error fetching artists with metrics:', err);
      return [];
    }
  },

  /**
   * Fetch artist by ID
   */
  async getArtistById(id: string): Promise<ProfileRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching artist by ID:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Fetch single artist profile with all their artworks
   */
  async getArtistProfileWithArtworks(artistId: string): Promise<{ artist: Artist; artworks: Artwork[] } | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const profile = await this.getArtistById(artistId);
      if (!profile) return null;

      const { data: artworkRows } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

      const artist = mapProfileToArtist(profile);
      const artworks = (artworkRows || []).map((art) => mapArtworkRowToArtwork(art, profile));
      return { artist, artworks };
    } catch (err) {
      console.warn('Error fetching artist profile with artworks:', err);
      return null;
    }
  },

  /**
   * Fetch all artworks as raw ArtworkRow
   */
  async getArtworks(): Promise<ArtworkRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching artworks from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch all artworks joined with artist profile details
   */
  async getArtworksWithArtists(): Promise<Artwork[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const artworkRows = await this.getArtworks();
      if (!artworkRows.length) return [];

      const artistIds = Array.from(new Set(artworkRows.map((a) => a.artist_id)));
      const { data: artistProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', artistIds);

      const profileMap: Record<string, ProfileRow> = {};
      if (artistProfiles) {
        artistProfiles.forEach((p) => {
          profileMap[p.id] = p;
        });
      }

      // Fetch like and save counts
      const { data: likes } = await supabase.from('likes').select('artwork_id');
      const { data: saves } = await supabase.from('saves').select('artwork_id').not('artwork_id', 'is', null);

      const likeCounts: Record<string, number> = {};
      if (likes) {
        likes.forEach((l) => {
          likeCounts[l.artwork_id] = (likeCounts[l.artwork_id] || 0) + 1;
        });
      }

      const saveCounts: Record<string, number> = {};
      if (saves) {
        saves.forEach((s) => {
          if (s.artwork_id) {
            saveCounts[s.artwork_id] = (saveCounts[s.artwork_id] || 0) + 1;
          }
        });
      }

      return artworkRows.map((row) =>
        mapArtworkRowToArtwork(row, profileMap[row.artist_id], {
          likesCount: likeCounts[row.id] || 0,
          savesCount: saveCounts[row.id] || 0
        })
      );
    } catch (err) {
      console.warn('Error fetching artworks with artists:', err);
      return [];
    }
  },

  /**
   * Fetch artwork by ID
   */
  async getArtworkById(id: string): Promise<ArtworkRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching artwork by ID:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Create artwork record in Supabase
   */
  async createArtwork(data: {
    title: string;
    description?: string;
    medium?: string;
    category?: string;
    imageUrl: string;
  }): Promise<ArtworkRow | null> {
    if (!isSupabaseConfigured()) return null;
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to upload artwork');

    const { data: newRow, error } = await supabase
      .from('artworks')
      .insert({
        artist_id: user.id,
        title: data.title,
        description: data.description || '',
        medium: data.medium || '',
        category: data.category || 'Visual Art',
        image_url: data.imageUrl
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return newRow;
  },

  /**
   * Update artwork record in Supabase
   */
  async updateArtwork(
    artworkId: string,
    updates: {
      title?: string;
      description?: string;
      medium?: string;
      category?: string;
      imageUrl?: string;
    }
  ): Promise<ArtworkRow | null> {
    if (!isSupabaseConfigured()) return null;
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to edit artwork');

    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.medium !== undefined) payload.medium = updates.medium;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;

    const { data, error } = await supabase
      .from('artworks')
      .update(payload)
      .match({ id: artworkId, artist_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete artwork record and associated storage file
   */
  async deleteArtwork(artworkId: string, imageUrl?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to delete artwork');

    if (imageUrl) {
      await storageService.deleteArtworkImage(imageUrl).catch(() => {});
    }

    const { error } = await supabase
      .from('artworks')
      .delete()
      .match({ id: artworkId, artist_id: user.id });

    if (error) throw error;
    return true;
  },

  /**
   * Fetch opportunities as raw OpportunityRow
   */
  async getOpportunities(): Promise<OpportunityRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching opportunities from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch opportunities mapped to Opportunity domain model
   */
  async getOpportunitiesData(): Promise<Opportunity[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const rows = await this.getOpportunities();
      return rows.map(mapOpportunityRowToOpportunity);
    } catch (err) {
      console.warn('Error mapping opportunities:', err);
      return [];
    }
  },

  /**
   * Follow an artist
   */
  async followArtist(artistId: string) {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to follow artists');

    if (user.id === artistId) {
      throw new Error('You cannot follow your own artist profile');
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        artist_id: artistId
      })
      .select()
      .single();

    if (error && error.code !== '23505') {
      throw error;
    }
    return { success: true, data };
  },

  /**
   * Unfollow an artist
   */
  async unfollowArtist(artistId: string) {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ follower_id: user.id, artist_id: artistId });

    if (error) throw error;
    return { success: true };
  },

  /**
   * Fetch comments for a specific artwork
   */
  async getComments(artworkId: string): Promise<Comment[]> {
    if (!isSupabaseConfigured() || !artworkId) return [];
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Error fetching comments:', error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Fetch user profile details for each commenter
      const userIds = Array.from(new Set(data.map((c) => c.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);

      const profileMap: Record<string, any> = {};
      if (profiles) {
        profiles.forEach((p) => {
          profileMap[p.id] = p;
        });
      }

      return data.map((c) => {
        const profile = profileMap[c.user_id];
        const name = profile?.full_name || profile?.username || 'Art Enthusiast';
        const avatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
        return {
          id: c.id,
          artworkId: c.artwork_id,
          userId: c.user_id,
          userName: name,
          userAvatar: avatar,
          text: c.content,
          createdAt: c.created_at ? c.created_at.split('T')[0] : 'Today'
        };
      });
    } catch (err) {
      console.warn('Error in getComments:', err);
      return [];
    }
  },

  /**
   * Post a new comment on an artwork
   */
  async createComment(artworkId: string, content: string): Promise<Comment | null> {
    if (!isSupabaseConfigured()) return null;
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to comment');
    if (!content.trim()) throw new Error('Comment cannot be empty');

    const profile = await this.getCurrentProfile();

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        artwork_id: artworkId,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      artworkId: data.artwork_id,
      userId: data.user_id,
      userName: profile?.full_name || profile?.username || 'You',
      userAvatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text: data.content,
      createdAt: 'Just now'
    };
  },

  /**
   * Edit an existing comment (author only)
   */
  async updateComment(commentId: string, content: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required');
    if (!content.trim()) throw new Error('Comment cannot be empty');

    const { error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .match({ id: commentId, user_id: user.id });

    if (error) throw error;
    return true;
  },

  /**
   * Delete an existing comment (author only)
   */
  async deleteComment(commentId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('comments')
      .delete()
      .match({ id: commentId, user_id: user.id });

    if (error) throw error;
    return true;
  },

  /**
   * Realtime subscription for comments on an artwork
   */
  subscribeToArtworkComments(artworkId: string, onChange: () => void) {
    if (!isSupabaseConfigured() || !artworkId) return () => {};

    const channel = supabase
      .channel(`comments-artwork-${artworkId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `artwork_id=eq.${artworkId}`
        },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Like artwork
   */
  async likeArtwork(artworkId: string) {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to like artwork');

    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        artwork_id: artworkId
      })
      .select()
      .single();

    if (error && error.code !== '23505') {
      throw error;
    }
    return { success: true, data };
  },

  /**
   * Unlike artwork
   */
  async unlikeArtwork(artworkId: string) {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ user_id: user.id, artwork_id: artworkId });

    if (error) throw error;
    return { success: true };
  },

  /**
   * Save item (artwork, artist, or opportunity)
   */
  async saveItem(item: { artworkId?: string; artistId?: string; opportunityId?: string }) {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to save items');

    const { data, error } = await supabase
      .from('saves')
      .insert({
        user_id: user.id,
        artwork_id: item.artworkId || null,
        artist_id: item.artistId || null,
        opportunity_id: item.opportunityId || null
      })
      .select()
      .single();

    if (error && error.code !== '23505') {
      throw error;
    }
    return { success: true, data };
  },

  /**
   * Unsave item
   */
  async unsaveItem(item: { artworkId?: string; artistId?: string; opportunityId?: string }) {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    let query = supabase.from('saves').delete().eq('user_id', user.id);
    if (item.artworkId) query = query.eq('artwork_id', item.artworkId);
    if (item.artistId) query = query.eq('artist_id', item.artistId);
    if (item.opportunityId) query = query.eq('opportunity_id', item.opportunityId);

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  },

  /**
   * Get user's saved items, likes, and follows
   */
  async getUserEngagement(userId: string) {
    if (!isSupabaseConfigured() || !userId) {
      return {
        likedArtworkIds: [],
        savedArtworkIds: [],
        savedArtistIds: [],
        savedOpportunityIds: [],
        followedArtistIds: []
      };
    }

    try {
      const [likesRes, savesRes, followsRes] = await Promise.all([
        supabase.from('likes').select('artwork_id').eq('user_id', userId),
        supabase.from('saves').select('artwork_id, artist_id, opportunity_id').eq('user_id', userId),
        supabase.from('follows').select('artist_id').eq('follower_id', userId)
      ]);

      const likedArtworkIds = (likesRes.data || []).map((l) => l.artwork_id);
      const savedArtworkIds: string[] = [];
      const savedArtistIds: string[] = [];
      const savedOpportunityIds: string[] = [];

      (savesRes.data || []).forEach((s) => {
        if (s.artwork_id) savedArtworkIds.push(s.artwork_id);
        if (s.artist_id) savedArtistIds.push(s.artist_id);
        if (s.opportunity_id) savedOpportunityIds.push(s.opportunity_id);
      });

      const followedArtistIds = (followsRes.data || []).map((f) => f.artist_id);

      return {
        likedArtworkIds,
        savedArtworkIds,
        savedArtistIds,
        savedOpportunityIds,
        followedArtistIds
      };
    } catch (err) {
      console.warn('Error fetching user engagement:', err);
      return {
        likedArtworkIds: [],
        savedArtworkIds: [],
        savedArtistIds: [],
        savedOpportunityIds: [],
        followedArtistIds: []
      };
    }
  },

  /**
   * Create collaboration proposal
   */
  async createCollaborationRequest(req: {
    receiverId: string;
    message: string;
    artworkId?: string;
    opportunityId?: string;
  }) {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to propose collaboration');

    const { data, error } = await supabase
      .from('collaboration_requests')
      .insert({
        sender_id: user.id,
        receiver_id: req.receiverId,
        message: req.message,
        artwork_id: req.artworkId || null,
        opportunity_id: req.opportunityId || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  /**
   * Fetch collaborations for current user
   */
  async getCollaborations() {
    if (!isSupabaseConfigured()) return [];
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('collaboration_requests')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching collaboration requests:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Update collaboration status (accepted or rejected) by receiver
   */
  async updateCollaborationStatus(collabId: string, status: 'accepted' | 'rejected') {
    if (!isSupabaseConfigured()) return { success: false };
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('collaboration_requests')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .match({ id: collabId, receiver_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  /**
   * Create a notification for a user
   */
  async createNotification(notif: {
    userId: string;
    type: string;
    title: string;
    message?: string;
  }) {
    if (!isSupabaseConfigured() || !notif.userId) return null;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notif.userId,
          type: notif.type,
          title: notif.title,
          message: notif.message || null,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.warn('Notification insert notice:', error.message);
        return null;
      }
      return data;
    } catch (err: any) {
      console.warn('Notification insert notice:', err?.message || err);
      return null;
    }
  },

  /**
   * Fetch current user's notifications
   */
  async getNotifications(): Promise<NotificationRow[]> {
    if (!isSupabaseConfigured()) return [];
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching notifications:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: string) {
    if (!isSupabaseConfigured()) return;
    const user = await this.getCurrentUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .match({ id, user_id: user.id });
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllNotificationsAsRead() {
    if (!isSupabaseConfigured()) return;
    const user = await this.getCurrentUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);
  },

  /**
   * Multi-entity search across Artists, Artworks, and Opportunities
   */
  async searchContent(query: string): Promise<{ artists: Artist[]; artworks: Artwork[]; opportunities: Opportunity[] }> {
    if (!isSupabaseConfigured() || !query.trim()) {
      return { artists: [], artworks: [], opportunities: [] };
    }

    const q = query.trim();
    try {
      const [artistsRes, artworksRes, oppsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'artist')
          .or(`full_name.ilike.%${q}%,username.ilike.%${q}%,primary_medium.ilike.%${q}%,city.ilike.%${q}%,country.ilike.%${q}%`)
          .limit(12),
        supabase
          .from('artworks')
          .select('*')
          .or(`title.ilike.%${q}%,medium.ilike.%${q}%,category.ilike.%${q}%`)
          .limit(12),
        supabase
          .from('opportunities')
          .select('*')
          .or(`title.ilike.%${q}%,organization.ilike.%${q}%,category.ilike.%${q}%,location.ilike.%${q}%`)
          .limit(12)
      ]);

      const artists = (artistsRes.data || []).map((p) => mapProfileToArtist(p));
      const artworks = (artworksRes.data || []).map((art) => mapArtworkRowToArtwork(art));
      const opportunities = (oppsRes.data || []).map(mapOpportunityRowToOpportunity);

      return { artists, artworks, opportunities };
    } catch (err) {
      console.warn('Error searching Supabase:', err);
      return { artists: [], artworks: [], opportunities: [] };
    }
  },

  /**
   * Realtime subscription for authenticated user events (notifications & collaborations)
   */
  subscribeToUserEvents(
    userId: string,
    callbacks: {
      onNotification?: (row: NotificationRow) => void;
      onCollaboration?: (row: CollaborationRow) => void;
    }
  ) {
    if (!isSupabaseConfigured() || !userId) return () => {};

    const channel = supabase
      .channel(`user-channel-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onNotification && payload.new) {
            callbacks.onNotification(payload.new as NotificationRow);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_requests',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onCollaboration && payload.new) {
            callbacks.onCollaboration(payload.new as CollaborationRow);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Structured data preparation for AI Match feature
   */
  async getAIMatchData() {
    return {
      artistProfiles: await this.getArtists(),
      artworks: await this.getArtworks(),
      opportunities: await this.getOpportunities()
    };
  }
};
