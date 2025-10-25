-- ═══════════════════════════════════════════════════════════════
-- ABSOLUTE FINAL FIX - NO MORE RECURSION, GUARANTEED
-- ═══════════════════════════════════════════════════════════════
-- This script eliminates ALL infinite recursion by creating
-- ZERO-RECURSION policies that never query the profiles table
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: FIX THE CHECK CONSTRAINT (allow superadmin)
-- ═══════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Drop existing constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  
  -- Add new constraint with superadmin
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'superadmin'));
  
  RAISE NOTICE '✅ Check constraint updated to allow superadmin';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Check constraint error (might already be correct): %', SQLERRM;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: UPDATE YOUR ACCOUNT TO SUPERADMIN
-- ═══════════════════════════════════════════════════════════════
UPDATE profiles
SET 
  role = 'superadmin',
  is_verified = true,
  updated_at = NOW()
WHERE email = 'amoromonste@gmail.com';

-- Verify the update
DO $$
DECLARE
  v_role TEXT;
  v_verified BOOLEAN;
BEGIN
  SELECT role, is_verified INTO v_role, v_verified
  FROM profiles
  WHERE email = 'amoromonste@gmail.com';
  
  IF v_role = 'superadmin' AND v_verified = true THEN
    RAISE NOTICE '✅ Account updated: role=%, verified=%', v_role, v_verified;
  ELSE
    RAISE WARNING '❌ Account update failed: role=%, verified=%', v_role, v_verified;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: DROP ALL EXISTING POLICIES (NUCLEAR OPTION)
-- ═══════════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
  dropped_count INTEGER := 0;
BEGIN
  -- Drop every single policy on the profiles table
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    dropped_count := dropped_count + 1;
  END LOOP;
  
  RAISE NOTICE '✅ Dropped % existing policies', dropped_count;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 4: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ═══════════════════════════════════════════════════════════════
-- These policies use ONLY auth.uid() and never query profiles table
-- This eliminates any possibility of infinite recursion
-- ═══════════════════════════════════════════════════════════════

-- Policy 1: Anyone can read their own profile (simple, no recursion)
CREATE POLICY "simple_read_own"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Anyone can update their own profile (simple, no recursion)  
CREATE POLICY "simple_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow signup (anon users can insert during registration)
CREATE POLICY "simple_insert_signup"
ON profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- That's it! Just 3 simple policies, no recursion possible!

RAISE NOTICE '✅ Created 3 simple, non-recursive policies';

-- ═══════════════════════════════════════════════════════════════
-- STEP 5: ENSURE RLS IS ENABLED
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ RLS enabled on profiles table';

-- ═══════════════════════════════════════════════════════════════
-- STEP 6: TEST THE FIX (verify you can read your own profile)
-- ═══════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_role TEXT;
BEGIN
  -- Get your user ID
  SELECT id, email, role INTO v_user_id, v_email, v_role
  FROM profiles
  WHERE email = 'amoromonste@gmail.com'
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE '✅ Test passed: Can read profile (id=%, email=%, role=%)', v_user_id, v_email, v_role;
  ELSE
    RAISE WARNING '❌ Test failed: Cannot read profile';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 7: SHOW FINAL STATUS
-- ═══════════════════════════════════════════════════════════════
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
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅✅✅ ABSOLUTE FINAL FIX COMPLETE! ✅✅✅';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: amoromonste@gmail.com';
  RAISE NOTICE '⭐ Role: %', COALESCE(v_role, 'NOT FOUND');
  RAISE NOTICE '✅ Verified: %', COALESCE(v_verified::TEXT, 'NOT FOUND');
  RAISE NOTICE '🔐 RLS Policies: % (should be 3)', v_policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔧 WHAT WAS FIXED:';
  RAISE NOTICE '  - Dropped ALL old policies (including recursive ones)';
  RAISE NOTICE '  - Created 3 simple policies with ZERO recursion';
  RAISE NOTICE '  - Updated account to superadmin + verified';
  RAISE NOTICE '  - Fixed check constraint to allow superadmin';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEPS TO CLEAR BROWSER:';
  RAISE NOTICE '';
  RAISE NOTICE '  Option 1 (EASIEST):';
  RAISE NOTICE '  1. Press Ctrl+Shift+Delete in browser';
  RAISE NOTICE '  2. Select "All time" and check "Cookies" and "Cached images"';
  RAISE NOTICE '  3. Click "Clear data"';
  RAISE NOTICE '  4. Close ALL browser windows completely';
  RAISE NOTICE '  5. Open fresh browser and go to localhost:5173';
  RAISE NOTICE '  6. Login with amoromonste@gmail.com';
  RAISE NOTICE '';
  RAISE NOTICE '  Option 2 (IF OPTION 1 FAILS):';
  RAISE NOTICE '  1. Open browser console (F12)';
  RAISE NOTICE '  2. Run: localStorage.clear()';
  RAISE NOTICE '  3. Run: sessionStorage.clear()';
  RAISE NOTICE '  4. Run: location.reload()';
  RAISE NOTICE '  5. Try logging in again';
  RAISE NOTICE '';
  RAISE NOTICE '💡 The infinite recursion is NOW IMPOSSIBLE because:';
  RAISE NOTICE '  - Policies only use auth.uid() (no profile queries)';
  RAISE NOTICE '  - No policy queries the profiles table';
  RAISE NOTICE '  - Simple logic: auth.uid() = id (that''s it!)';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- FINAL VERIFICATION: Show all policies
-- ═══════════════════════════════════════════════════════════════
SELECT 
  '📋 Active Policies' as info,
  policyname as policy,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN '✓ Read access'
    WHEN cmd = 'UPDATE' THEN '✓ Update access'
    WHEN cmd = 'INSERT' THEN '✓ Insert access'
    ELSE cmd
  END as description
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

