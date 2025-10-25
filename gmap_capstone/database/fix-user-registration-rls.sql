-- FIX USER REGISTRATION DATABASE ERROR
-- Run this in Supabase SQL Editor to fix "Database error saving new user"

-- ============================================
-- STEP 1: Check current RLS status
-- ============================================
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- ============================================
-- STEP 2: Drop existing conflicting policies
-- ============================================
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert for anon users during signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

-- ============================================
-- STEP 3: Create proper RLS policies
-- ============================================

-- Allow anonymous users to INSERT during registration
CREATE POLICY "Allow anon to insert profiles during signup"
ON profiles FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Allow authenticated to insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to SELECT their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- STEP 4: Ensure RLS is enabled
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Verify policies
-- ============================================
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'User registration RLS policies fixed successfully!' as status;

