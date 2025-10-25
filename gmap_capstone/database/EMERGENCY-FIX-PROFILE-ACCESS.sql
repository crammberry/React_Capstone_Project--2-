-- =================================================================
-- EMERGENCY FIX - Profile Access (Super Simple Version)
-- =================================================================
-- If you're stuck at "pending" again, run this!
-- This is the SIMPLEST possible fix - just grants access to everyone
-- =================================================================

-- =================================================================
-- STEP 1: DISABLE RLS TEMPORARILY
-- =================================================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- STEP 2: VERIFY YOUR ACCOUNT
-- =================================================================
SELECT 
  '🔍 Your Account Info:' as check,
  id,
  email,
  role,
  is_verified,
  created_at
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- =================================================================
-- STEP 3: DROP ALL POLICIES (NUCLEAR)
-- =================================================================
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
    RAISE NOTICE 'Dropped: %', r.policyname;
  END LOOP;
END $$;

-- =================================================================
-- STEP 4: RE-ENABLE RLS
-- =================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- STEP 5: CREATE ONLY 1 SUPER SIMPLE POLICY
-- =================================================================
-- This policy allows EVERYONE to read their own profile
-- No recursion, no complexity, just works
CREATE POLICY "allow_own_profile_access"
ON profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow signup
CREATE POLICY "allow_signup_insert"
ON profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- =================================================================
-- STEP 6: VERIFY SUCCESS
-- =================================================================
DO $$
DECLARE
  v_email TEXT := 'amoromonste@gmail.com';
  v_role TEXT;
  v_verified BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- Get your account
  SELECT role, is_verified INTO v_role, v_verified
  FROM profiles
  WHERE email = v_email;
  
  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'profiles' AND schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ EMERGENCY FIX COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: %', v_email;
  RAISE NOTICE '⭐ Role: %', COALESCE(v_role, 'NOT FOUND!');
  RAISE NOTICE '✅ Verified: %', COALESCE(v_verified::TEXT, 'NOT FOUND!');
  RAISE NOTICE '🔐 Policies: % (should be 2)', v_policy_count;
  RAISE NOTICE '';
  
  IF v_role = 'superadmin' AND v_verified = true AND v_policy_count = 2 THEN
    RAISE NOTICE '🎉 PERFECT! Everything is ready!';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NOW DO THIS:';
    RAISE NOTICE '1. Press Ctrl+Shift+Delete';
    RAISE NOTICE '2. Clear ALL browser data';
    RAISE NOTICE '3. Close ALL browser windows';
    RAISE NOTICE '4. Open fresh browser';
    RAISE NOTICE '5. Go to localhost:5173';
    RAISE NOTICE '6. Login with amoromonste@gmail.com';
    RAISE NOTICE '7. Should work immediately!';
  ELSE
    RAISE WARNING '⚠️ Something is wrong:';
    IF v_role IS NULL THEN
      RAISE WARNING '   - Account NOT FOUND in database!';
    ELSIF v_role != 'superadmin' THEN
      RAISE WARNING '   - Role is "%" instead of "superadmin"', v_role;
    END IF;
    IF NOT v_verified THEN
      RAISE WARNING '   - Account not verified!';
    END IF;
    IF v_policy_count != 2 THEN
      RAISE WARNING '   - Wrong number of policies: %', v_policy_count;
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

