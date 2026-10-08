-- ============================================================================
-- ARTVERSE — Collaboration and Notifications Triggers & Security Policies
-- Migration: 20261005000002_notifications_and_collab_triggers.sql
-- ============================================================================

-- 1. NOTIFICATIONS INSERT POLICY
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. TRIGGER: NOTIFY ON NEW FOLLOW
CREATE OR REPLACE FUNCTION public.handle_new_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_name TEXT;
BEGIN
  -- Avoid self-notification
  IF NEW.follower_id = NEW.artist_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username, 'An art collector')
  INTO v_follower_name
  FROM public.profiles
  WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    NEW.artist_id,
    'follower',
    'New Follower',
    v_follower_name || ' started following your creative portfolio.',
    false,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_added_notification ON public.follows;
CREATE TRIGGER on_follow_added_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow_notification();

-- 3. TRIGGER: NOTIFY ON ARTWORK LIKE
CREATE OR REPLACE FUNCTION public.handle_artwork_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_liker_name TEXT;
  v_artist_id UUID;
  v_artwork_title TEXT;
BEGIN
  SELECT artist_id, title INTO v_artist_id, v_artwork_title
  FROM public.artworks
  WHERE id = NEW.artwork_id;

  -- Do not notify if liking own artwork or artwork not found
  IF v_artist_id IS NULL OR NEW.user_id = v_artist_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username, 'A community member')
  INTO v_liker_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    v_artist_id,
    'like',
    'Artwork Liked',
    v_liker_name || ' liked your artwork "' || COALESCE(v_artwork_title, 'Original Piece') || '".',
    false,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_added_notification ON public.likes;
CREATE TRIGGER on_like_added_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like_notification();

-- 4. TRIGGER: NOTIFY ON NEW COMMENT
CREATE OR REPLACE FUNCTION public.handle_artwork_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_commenter_name TEXT;
  v_artist_id UUID;
  v_artwork_title TEXT;
BEGIN
  SELECT artist_id, title INTO v_artist_id, v_artwork_title
  FROM public.artworks
  WHERE id = NEW.artwork_id;

  -- Do not notify if commenter is the artist
  IF v_artist_id IS NULL OR NEW.user_id = v_artist_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username, 'A creator')
  INTO v_commenter_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    v_artist_id,
    'comment',
    'New Dialogue on Artwork',
    v_commenter_name || ' commented on your artwork "' || COALESCE(v_artwork_title, 'Original Piece') || '".',
    false,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_added_notification ON public.comments;
CREATE TRIGGER on_comment_added_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_artwork_comment_notification();
