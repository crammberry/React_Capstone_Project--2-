-- CHECK WHAT POLICIES ARE CURRENTLY IN YOUR DATABASE
-- Run this to see what's causing the 500 errors

-- Check if RLS is enabled on profiles
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- List ALL policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Count how many policies exist
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

