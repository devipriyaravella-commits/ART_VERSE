-- ============================================================================
-- ARTVERSE — Production Database Schema, Relationships, Indexes & RLS
-- ============================================================================

-- 1. Enable Required Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. REUSABLE UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABLES DEFINITIONS & CONSTRAINTS
-- ============================================================================

--------------------------------------------------------------------------------
-- TABLE 1: profiles
-- Stores extended creator and curator profile information referencing auth.users(id)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('artist', 'explorer')),
  bio TEXT,
  city TEXT,
  country TEXT,
  primary_medium TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  cover_url TEXT,
  website_url TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'not_available')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------------
-- TABLE 2: artworks
-- An artwork belongs to exactly one artist (profiles.id)
-- Note: ON DELETE CASCADE on artist_id ensures artworks are cleared if artist profile is deleted,
-- while deleting an artwork never affects the artist's profile.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  medium TEXT,
  category TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_artworks_updated_at ON public.artworks;
CREATE TRIGGER set_artworks_updated_at
  BEFORE UPDATE ON public.artworks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------------
-- TABLE 3: opportunities
-- Grants, residencies, exhibitions, freelance commissions, and creative open calls
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT,
  type TEXT,
  location TEXT,
  category TEXT,
  deadline TIMESTAMPTZ,
  application_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------------
-- TABLE 4: follows
-- Follower community network. Prevents duplicates and self-follows.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_follow UNIQUE (follower_id, artist_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> artist_id)
);

--------------------------------------------------------------------------------
-- TABLE 5: likes
-- Engagement likes on artworks. Prevents duplicate likes.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_like UNIQUE (user_id, artwork_id)
);

--------------------------------------------------------------------------------
-- TABLE 6: saves
-- Curated personal bookmarks for an artwork, artist, or opportunity.
-- Exactly one target entity per save record. Prevents duplicates.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT check_save_target CHECK (
    (artwork_id IS NOT NULL AND artist_id IS NULL AND opportunity_id IS NULL) OR
    (artwork_id IS NULL AND artist_id IS NOT NULL AND opportunity_id IS NULL) OR
    (artwork_id IS NULL AND artist_id IS NULL AND opportunity_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_artwork_save 
  ON public.saves(user_id, artwork_id) WHERE artwork_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_artist_save 
  ON public.saves(user_id, artist_id) WHERE artist_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_opp_save 
  ON public.saves(user_id, opportunity_id) WHERE opportunity_id IS NOT NULL;

--------------------------------------------------------------------------------
-- TABLE 7: comments
-- Critiques, community discussions, and dialogue on artworks.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------------
-- TABLE 8: collaboration_requests
-- Private proposals, curatorial commissions, and creative inquiries.
-- Prevents self-collaborations.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT no_self_collab CHECK (sender_id <> receiver_id)
);

DROP TRIGGER IF EXISTS set_collab_updated_at ON public.collaboration_requests;
CREATE TRIGGER set_collab_updated_at
  BEFORE UPDATE ON public.collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------------
-- TABLE 9: notifications
-- Private in-app notifications for users.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- TABLE 10: ai_matches
-- AI Match core recommendations for artist, opportunity, or collaboration matches.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('artist', 'opportunity', 'collaboration')),
  match_percentage NUMERIC CHECK (match_percentage >= 0 AND match_percentage <= 100),
  match_reason TEXT,
  relevant_skills TEXT[] DEFAULT '{}',
  portfolio_alignment TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================

-- artworks indexes
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON public.artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at DESC);

-- opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

-- follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_artist_id ON public.follows(artist_id);

-- likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_artwork_id ON public.likes(artwork_id);

-- saves indexes
CREATE INDEX IF NOT EXISTS idx_saves_user_id ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_artwork_id ON public.saves(artwork_id) WHERE artwork_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_saves_artist_id ON public.saves(artist_id) WHERE artist_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_saves_opp_id ON public.saves(opportunity_id) WHERE opportunity_id IS NOT NULL;

-- comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_artwork_id ON public.comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- collaboration_requests indexes
CREATE INDEX IF NOT EXISTS idx_collab_sender_id ON public.collaboration_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_collab_receiver_id ON public.collaboration_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_collab_status ON public.collaboration_requests(status);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- ai_matches indexes
CREATE INDEX IF NOT EXISTS idx_ai_matches_user_id ON public.ai_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_matches_percentage ON public.ai_matches(user_id, match_percentage DESC);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- PROFILES POLICIES
-- Anyone can view public profile info.
-- Users can only insert/update their own profile using auth.uid()
--------------------------------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

--------------------------------------------------------------------------------
-- ARTWORKS POLICIES
-- Public users can view artworks.
-- Artists can create, update, and delete only their own artwork.
--------------------------------------------------------------------------------
CREATE POLICY "Artworks are viewable by everyone"
  ON public.artworks FOR SELECT
  USING (true);

CREATE POLICY "Artists can insert their own artwork"
  ON public.artworks FOR INSERT
  WITH CHECK (
    auth.uid() = artist_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'artist')
  );

CREATE POLICY "Artists can update their own artwork"
  ON public.artworks FOR UPDATE
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own artwork"
  ON public.artworks FOR DELETE
  USING (auth.uid() = artist_id);

--------------------------------------------------------------------------------
-- OPPORTUNITIES POLICIES
-- Public users can view opportunities.
-- Ordinary users cannot modify arbitrary opportunities (admin/service role only).
--------------------------------------------------------------------------------
CREATE POLICY "Opportunities are viewable by everyone"
  ON public.opportunities FOR SELECT
  USING (true);

--------------------------------------------------------------------------------
-- FOLLOWS POLICIES
-- Everyone can view follows for counts/lists.
-- Authenticated users can only create/delete their own follows.
--------------------------------------------------------------------------------
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can remove their own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

--------------------------------------------------------------------------------
-- LIKES POLICIES
-- Everyone can view likes for artwork like counts.
-- Authenticated users can only like as themselves or remove their own like.
--------------------------------------------------------------------------------
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like as themselves"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- SAVES POLICIES
-- Private to the user. Logged-out users have 0 access.
--------------------------------------------------------------------------------
CREATE POLICY "Users can view only their own saves"
  ON public.saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saves"
  ON public.saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
  ON public.saves FOR DELETE
  USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- COMMENTS POLICIES
-- Public users can view comments on artworks.
-- Authenticated users can insert as themselves, update or delete only their own.
--------------------------------------------------------------------------------
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- COLLABORATION REQUESTS POLICIES
-- Only sender or receiver can view a collaboration request.
-- Authenticated users can create requests as themselves.
-- Only the receiver can update status.
--------------------------------------------------------------------------------
CREATE POLICY "Users can view collaborations where they are sender or receiver"
  ON public.collaboration_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send collaboration requests as themselves"
  ON public.collaboration_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update collaboration status"
  ON public.collaboration_requests FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

--------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- Private to user. Users can only view or mark their own notifications as read.
--------------------------------------------------------------------------------
CREATE POLICY "Users can view only their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update only their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- AI MATCHES POLICIES
-- Private to user. Users can only view their own personalized recommendations.
-- Arbitrary browser client insertion is disallowed (service role / edge functions generate).
--------------------------------------------------------------------------------
CREATE POLICY "Users can view only their own ai matches"
  ON public.ai_matches FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. AUTOMATIC AUTH USER TRIGGER (Creates profile on signup)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    role,
    avatar_url,
    skills,
    interests,
    availability_status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 5)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'available'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. SUPABASE STORAGE BUCKETS AND SECURITY POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('cover-images', 'cover-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('artwork-images', 'artwork-images', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public Read for all 3 public buckets
DROP POLICY IF EXISTS "Public can view profile-images" ON storage.objects;
CREATE POLICY "Public can view profile-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Public can view cover-images" ON storage.objects;
CREATE POLICY "Public can view cover-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cover-images');

DROP POLICY IF EXISTS "Public can view artwork-images" ON storage.objects;
CREATE POLICY "Public can view artwork-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artwork-images');

-- Profile Images: Owner write/update/delete
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
CREATE POLICY "Users can upload their own profile image"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
CREATE POLICY "Users can update their own profile image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
CREATE POLICY "Users can delete their own profile image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Cover Images: Owner write/update/delete
DROP POLICY IF EXISTS "Users can upload their own cover image" ON storage.objects;
CREATE POLICY "Users can upload their own cover image"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cover-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own cover image" ON storage.objects;
CREATE POLICY "Users can update their own cover image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cover-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'cover-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own cover image" ON storage.objects;
CREATE POLICY "Users can delete their own cover image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cover-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Artwork Images: Artist write/update/delete
DROP POLICY IF EXISTS "Artists can upload artwork images" ON storage.objects;
CREATE POLICY "Artists can upload artwork images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artwork-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

DROP POLICY IF EXISTS "Artists can update their own artwork images" ON storage.objects;
CREATE POLICY "Artists can update their own artwork images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'artwork-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'artwork-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Artists can delete their own artwork images" ON storage.objects;
CREATE POLICY "Artists can delete their own artwork images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'artwork-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
