-- ============================================================================
-- ARTVERSE — Supabase Storage Buckets and Security Policies
-- Migration: 20261005000001_create_storage_buckets.sql
-- ============================================================================

-- 1. Create Storage Buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  ),
  (
    'cover-images',
    'cover-images',
    true,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  ),
  (
    'artwork-images',
    'artwork-images',
    true,
    15728640, -- 15 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- 2. STORAGE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on storage.objects (default in Supabase, but ensured here)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- A. PUBLIC READ ACCESS
-- Anyone (visitors, unauthenticated users) can view public artwork and profiles
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- B. PROFILE IMAGES: Upload, Update, Delete
-- Strict Owner Isolation: Users can only upload/modify files inside their own user folder
-- Folder structure: profile-images/{auth.uid()}/filename.ext
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- C. COVER IMAGES: Upload, Update, Delete
-- Strict Owner Isolation: Users can only upload/modify files inside their own user folder
-- Folder structure: cover-images/{auth.uid()}/filename.ext
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- D. ARTWORK IMAGES: Upload, Update, Delete
-- Strict Artist Isolation: Only authenticated artists can upload to their own folder
-- Folder structure: artwork-images/{auth.uid()}/...
--------------------------------------------------------------------------------
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
