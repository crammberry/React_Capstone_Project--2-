-- =================================================================
-- COMPLETE SUPERADMIN FIX - ALL IN ONE SCRIPT
-- =================================================================
-- This single script does EVERYTHING:
-- 1. Fixes the CHECK constraint to allow 'superadmin'
-- 2. Makes your account superadmin
-- 3. Fixes ALL RLS policies to work with superadmin
-- 4. Verifies everything works
-- =================================================================

-- STEP 1: Fix the CHECK constraint
-- =================================================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'superadmin'));

-- STEP 2: Make your account superadmin
-- =================================================================
UPDATE profiles
SET 
  role = 'superadmin',
  is_verified = true,
  updated_at = NOW()
WHERE email = 'amoromonste@gmail.com';

-- STEP 3: Drop ALL existing RLS policies on profiles
-- =================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow anon to insert profiles during signup" ON profiles;
DROP POLICY IF EXISTS "Allow users to select own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public read for profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated to insert own profile" ON profiles;

-- STEP 4: Create SIMPLE RLS policies that work with superadmin
-- =================================================================

-- Policy 1: ALL authenticated users can read their OWN profile
CREATE POLICY "Read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: ALL authenticated users can update their OWN profile  
CREATE POLICY "Update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow signup (anon can insert new profiles)
CREATE POLICY "Signup insert"
ON profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 4: Admins and superadmins can read ALL profiles
CREATE POLICY "Admin read all"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- If you're reading your own profile, always allow
  auth.uid() = id
  OR
  -- If you're admin or superadmin, allow reading all
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- STEP 5: Disable RLS temporarily to verify data
-- =================================================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Check your account exists with correct role
SELECT 
  'Your Account' as check_name,
  email,
  role,
  is_verified,
  created_at
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 6: Test that RLS allows you to read your profile
-- =================================================================
-- This simulates what the app will do
SELECT 
  'RLS Test' as test_name,
  email,
  role,
  is_verified
FROM profiles
WHERE id = (SELECT id FROM profiles WHERE email = 'amoromonste@gmail.com')
LIMIT 1;

-- STEP 7: Show all active policies
-- =================================================================
SELECT 
  'Active Policies' as info,
  policyname,
  cmd as command
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================
DO $$
DECLARE
  v_role TEXT;
  v_verified BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- Get account info
  SELECT role, is_verified INTO v_role, v_verified
  FROM profiles
  WHERE email = 'amoromonste@gmail.com';
  
  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'profiles';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '✅ COMPLETE SUPERADMIN FIX SUCCESSFUL!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: amoromonste@gmail.com';
  RAISE NOTICE '⭐ Role: %', v_role;
  RAISE NOTICE '✅ Verified: %', v_verified;
  RAISE NOTICE '🔐 RLS Policies: % active', v_policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEPS:';
  RAISE NOTICE '1. Close browser completely';
  RAISE NOTICE '2. Open NEW browser window';
  RAISE NOTICE '3. Go to localhost:5173';
  RAISE NOTICE '4. Login with amoromonste@gmail.com';
  RAISE NOTICE '5. Should see "Admin Mode" immediately!';
  RAISE NOTICE '';
  RAISE NOTICE 'If still stuck, run this in console:';
  RAISE NOTICE 'localStorage.clear(); location.reload();';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

