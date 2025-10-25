-- QUICK FIX: User Registration RLS Policies
-- This version drops existing policies first to avoid conflicts

-- ============================================
-- STEP 1: Drop ALL existing policies on profiles
-- ============================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Create fresh RLS policies
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
-- STEP 3: Ensure RLS is enabled
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Verify policies were created
-- ============================================
SELECT 
  'SUCCESS: ' || count(*)::text || ' policies created' as status
FROM pg_policies 
WHERE tablename = 'profiles';

-- Show the policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

