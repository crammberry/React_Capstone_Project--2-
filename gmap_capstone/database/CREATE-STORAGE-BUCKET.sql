-- ============================================================================
-- CREATE STORAGE BUCKET FOR EXHUMATION & RESERVATION DOCUMENTS
-- ============================================================================
-- This script creates the storage bucket needed for document uploads
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exhumation-documents',
  'exhumation-documents',
  false, -- Not public, files are private
  5242880, -- 5MB max file size
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf',
    'image/heic',
    'image/heif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'image/heic',
    'image/heif'
  ]::text[];

-- Step 2: Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Step 3: Create RLS policies for the bucket

-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exhumation-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exhumation-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all documents
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exhumation-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'exhumation-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'exhumation-documents';

-- Check policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket "exhumation-documents" created successfully!';
  RAISE NOTICE '✅ RLS policies configured for user uploads and admin access';
  RAISE NOTICE '✅ File size limit: 5MB';
  RAISE NOTICE '✅ Allowed file types: JPEG, PNG, WEBP, PDF, HEIC, HEIF';
END $$;

