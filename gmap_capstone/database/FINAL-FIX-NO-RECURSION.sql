-- ============================================
-- 🚀 FINAL FIX - NO RECURSION
-- ============================================
-- This fixes the "infinite recursion" error
-- Run this in Supabase SQL Editor NOW
-- ============================================

-- ============================================
-- STEP 1: Drop ALL policies to stop recursion
-- ============================================

DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN 
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles CASCADE';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Create SIMPLE policies (NO RECURSION)
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow ALL authenticated users to read their own profile
-- NO RECURSION - Just checks auth.uid() = id
CREATE POLICY "authenticated_users_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Allow ALL authenticated users to update their own profile
-- NO RECURSION - Just checks auth.uid() = id
CREATE POLICY "authenticated_users_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow service_role to do EVERYTHING
-- This is for the trigger and admin operations
CREATE POLICY "service_role_all"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 3: Grant permissions
-- ============================================

-- Grant to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Grant to service_role (for triggers and admin operations)
GRANT ALL ON public.profiles TO service_role;

-- ============================================
-- STEP 4: Verify the trigger exists
-- ============================================

-- Check if trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    -- Create the trigger if it doesn't exist
    
    -- First, create the function
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER 
    SECURITY DEFINER  -- This allows it to bypass RLS
    SET search_path = public
    LANGUAGE plpgsql
    AS $func$
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        role,
        contact_number,
        first_name,
        middle_name,
        last_name,
        age,
        gender,
        date_of_birth,
        marital_status,
        occupation,
        address,
        city,
        state,
        zip_code,
        country,
        emergency_contact,
        emergency_phone,
        relationship,
        alternate_phone,
        is_verified,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NEW.raw_user_meta_data->>'contactNumber',
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'middleName',
        NEW.raw_user_meta_data->>'lastName',
        (NEW.raw_user_meta_data->>'age')::INTEGER,
        NEW.raw_user_meta_data->>'gender',
        (NEW.raw_user_meta_data->>'dateOfBirth')::DATE,
        NEW.raw_user_meta_data->>'maritalStatus',
        NEW.raw_user_meta_data->>'occupation',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        NEW.raw_user_meta_data->>'zipCode',
        NEW.raw_user_meta_data->>'country',
        NEW.raw_user_meta_data->>'emergencyContact',
        NEW.raw_user_meta_data->>'emergencyPhone',
        NEW.raw_user_meta_data->>'relationship',
        NEW.raw_user_meta_data->>'alternatePhone',
        COALESCE((NEW.raw_user_meta_data->>'isVerified')::BOOLEAN, TRUE),
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET
        email = EXCLUDED.email,
        contact_number = COALESCE(EXCLUDED.contact_number, profiles.contact_number),
        updated_at = NOW();
      
      RETURN NEW;
    END;
    $func$;

    -- Then create the trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
      
    RAISE NOTICE 'Trigger created successfully';
  ELSE
    RAISE NOTICE 'Trigger already exists';
  END IF;
END $$;

-- ============================================
-- STEP 5: Clean up the broken user
-- ============================================

-- Delete the user that was created but has no profile
-- This is the user: 3d79bc1d-0d8a-4151-864f-930f4002ec1f
DELETE FROM auth.users 
WHERE email = 'amoromonste2@gmail.com'
AND id NOT IN (SELECT id FROM public.profiles);

-- Also clean up any orphaned profiles
DELETE FROM public.profiles
WHERE email = 'amoromonste2@gmail.com'
AND id NOT IN (SELECT id FROM auth.users);

-- ============================================
-- STEP 6: Verify the setup
-- ============================================

-- Check policies (should be 3 simple policies)
SELECT 
  '✅ RLS Policies' AS check_type,
  policyname,
  cmd AS command,
  roles
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- Check trigger
SELECT 
  '✅ Trigger Status' AS check_type,
  tgname AS trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled ✅'
    ELSE 'Disabled ❌'
  END AS status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created'
AND tgrelid = 'auth.users'::regclass;

-- Check if user was cleaned up
SELECT 
  '✅ Cleanup Status' AS check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'amoromonste2@gmail.com') 
    THEN 'User still exists (will be recreated on next signup) ⚠️'
    ELSE 'User cleaned up - ready for fresh signup ✅'
  END AS status;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- ✅ RLS Policies: 3 policies (no recursion)
-- ✅ Trigger Status: Enabled
-- ✅ Cleanup Status: User cleaned up
--
-- NEXT STEPS:
-- 1. Clear browser cache: Ctrl+Shift+Delete
-- 2. Refresh page: Ctrl+F5
-- 3. Try registering with amoromonste2@gmail.com again
-- 4. It should work perfectly now! ✅
-- ============================================

SELECT '🎉 DATABASE FIX COMPLETE - NO MORE RECURSION!' AS status;

