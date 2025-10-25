-- ===============================================================================
-- CLEANUP: Remove Duplicate/Conflicting Policies
-- ===============================================================================
-- You have multiple SELECT policies causing conflicts
-- Let's keep ONLY the working ones
-- ===============================================================================

-- ============================================
-- STEP 1: Drop ALL SELECT Policies
-- ============================================

-- Remove old policy (might be causing issues)
DROP POLICY IF EXISTS "authenticated_read_profiles" ON profiles;

-- Remove any other variations
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- ============================================
-- STEP 2: Keep ONLY the Working Policy
-- ============================================

-- This one is already created and working, we're just making sure it's the ONLY SELECT policy
-- If it doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'allow_authenticated_read_all_profiles'
    ) THEN
        CREATE POLICY "allow_authenticated_read_all_profiles" ON profiles
          FOR SELECT
          TO authenticated
          USING (true);
    END IF;
END $$;

-- ============================================
-- STEP 3: Verify We Have Exactly 5 Policies
-- ============================================

SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY cmd, policyname;

-- Expected result (5 policies total):
-- allow_authenticated_read_all_profiles | SELECT
-- users_delete_own_profile              | DELETE
-- users_insert_own_profile              | INSERT
-- users_update_own_profile              | UPDATE

-- ============================================
-- STEP 4: Test Profile Query
-- ============================================

-- This should return instantly (< 100ms)
SELECT id, email, role FROM profiles WHERE email = 'amoromonste@gmail.com';

-- ============================================
-- ✅ DONE!
-- ============================================
-- Now you should have NO more timeout errors!
-- Every profile query should succeed immediately!

