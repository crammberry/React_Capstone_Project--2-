-- ═══════════════════════════════════════════════════════════════
-- NUCLEAR FIX - DROPS EVERYTHING AND REBUILDS FROM SCRATCH
-- ═══════════════════════════════════════════════════════════════
-- This script will work NO MATTER WHAT state your database is in
-- Run this if you're getting "policy already exists" errors
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: DROP ALL POLICIES (EVERY POSSIBLE ONE)
-- ═══════════════════════════════════════════════════════════════

-- Drop policies from ABSOLUTE-FINAL-FIX.sql
DROP POLICY IF EXISTS "simple_read_own" ON profiles;
DROP POLICY IF EXISTS "simple_update_own" ON profiles;
DROP POLICY IF EXISTS "simple_insert_signup" ON profiles;

-- Drop policies from COMPLETE-SUPERADMIN-FIX.sql
DROP POLICY IF EXISTS "Read own profile" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "Signup insert" ON profiles;
DROP POLICY IF EXISTS "Admin read all" ON profiles;

-- Drop policies from other scripts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow anon to insert profiles during signup" ON profiles;
DROP POLICY IF EXISTS "Allow users to select own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public read for profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated to insert own profile" ON profiles;
DROP POLICY IF EXISTS "authenticated_users_select_own" ON profiles;
DROP POLICY IF EXISTS "authenticated_users_update_own" ON profiles;
DROP POLICY IF EXISTS "service_role_all" ON profiles;
DROP POLICY IF EXISTS "Allow superadmin to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow superadmin to update profiles" ON profiles;
DROP POLICY IF EXISTS "Allow superadmin to update any profile including roles" ON profiles;

-- Nuclear option: Drop any remaining policies using dynamic SQL
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: FIX CHECK CONSTRAINT
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'superadmin'));
  RAISE NOTICE '✅ Check constraint fixed';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Check constraint error: %', SQLERRM;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: UPDATE YOUR ACCOUNT
-- ═══════════════════════════════════════════════════════════════

UPDATE profiles
SET 
  role = 'superadmin',
  is_verified = true,
  updated_at = NOW()
WHERE email = 'amoromonste@gmail.com';

-- ═══════════════════════════════════════════════════════════════
-- STEP 4: CREATE NEW SIMPLE POLICIES (NO RECURSION)
-- ═══════════════════════════════════════════════════════════════

-- Policy 1: Read own profile (simple UUID comparison)
CREATE POLICY "profiles_select_own"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Update own profile (simple UUID comparison)
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Insert during signup
CREATE POLICY "profiles_insert_signup"
ON profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- STEP 5: ENABLE RLS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- STEP 6: VERIFY SUCCESS
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_role TEXT;
  v_verified BOOLEAN;
  v_policy_count INTEGER;
  v_email TEXT := 'amoromonste@gmail.com';
BEGIN
  -- Check account
  SELECT role, is_verified INTO v_role, v_verified
  FROM profiles
  WHERE email = v_email;
  
  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'profiles' AND schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅✅✅ NUCLEAR FIX COMPLETE! ✅✅✅';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: %', v_email;
  RAISE NOTICE '⭐ Role: %', COALESCE(v_role, 'NOT FOUND');
  RAISE NOTICE '✅ Verified: %', COALESCE(v_verified::TEXT, 'NOT FOUND');
  RAISE NOTICE '🔐 Active Policies: %', v_policy_count;
  RAISE NOTICE '';
  
  IF v_role = 'superadmin' AND v_verified = true AND v_policy_count = 3 THEN
    RAISE NOTICE '🎉 SUCCESS! Everything is perfect!';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NEXT STEPS:';
    RAISE NOTICE '1. Press Ctrl+Shift+Delete in browser';
    RAISE NOTICE '2. Clear "All time" - Cookies + Cache';
    RAISE NOTICE '3. Close ALL browser windows';
    RAISE NOTICE '4. Open fresh browser → localhost:5173';
    RAISE NOTICE '5. Login with: amoromonste@gmail.com';
    RAISE NOTICE '6. Should see "Admin Mode" immediately!';
  ELSE
    RAISE WARNING '⚠️ Something might be wrong:';
    RAISE WARNING '   Role: % (expected: superadmin)', v_role;
    RAISE WARNING '   Verified: % (expected: true)', v_verified;
    RAISE WARNING '   Policies: % (expected: 3)', v_policy_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

-- Show all active policies
SELECT 
  '📋 Active Policies' as info,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

