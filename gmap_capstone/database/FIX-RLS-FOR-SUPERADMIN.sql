-- =================================================================
-- FIX RLS POLICIES TO ALLOW SUPERADMIN
-- =================================================================
-- The profiles table RLS policies are blocking superadmin from reading their own profile!
-- This fixes that by updating the policies to include superadmin
-- =================================================================

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow anon to insert profiles during signup" ON profiles;
DROP POLICY IF EXISTS "Allow users to select own profile" ON profiles;

-- Create new policies that work with superadmin
-- =================================================================

-- Policy 1: Users can read their own profile (including superadmin)
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Users can update their own profile (including superadmin)
CREATE POLICY "Users can update own profile"  
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 3: Allow anon to insert during signup
CREATE POLICY "Allow profile creation during signup"
ON profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 4: Admin and superadmin can read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- Allow if reading own profile
  id = auth.uid()
  OR
  -- Allow if user is admin or superadmin
  (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) IN ('admin', 'superadmin')
);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test query: Check if you can read your own profile
SELECT 
  email,
  role,
  is_verified
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ RLS POLICIES FIXED FOR SUPERADMIN! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Profiles table policies updated';
  RAISE NOTICE '⭐ Superadmin can now read their own profile';
  RAISE NOTICE '👥 Admins can read all profiles';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEPS:';
  RAISE NOTICE '1. Logout from your app';
  RAISE NOTICE '2. Clear browser (Ctrl+Shift+Delete)';
  RAISE NOTICE '3. Login again';
  RAISE NOTICE '4. Should see "Admin Mode" now!';
  RAISE NOTICE '';
END $$;

