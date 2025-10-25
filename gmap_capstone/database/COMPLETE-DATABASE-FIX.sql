-- ============================================
-- 🔥 COMPLETE DATABASE FIX - Run This NOW
-- ============================================
-- This fixes ALL database issues preventing user registration
-- SAFE to run multiple times - Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Remove ALL conflicting triggers
-- ============================================

-- Drop any existing triggers that might conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users CASCADE;

-- Drop old functions that might be causing issues
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.auto_confirm_user() CASCADE;

-- ============================================
-- STEP 2: Remove ALL existing RLS policies
-- ============================================

-- Drop all policies on profiles table
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
-- STEP 3: Create trigger to auto-create profile
-- ============================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER  -- This is CRITICAL - allows function to bypass RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile for new user
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
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    middle_name = COALESCE(EXCLUDED.middle_name, profiles.middle_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    age = COALESCE(EXCLUDED.age, profiles.age),
    gender = COALESCE(EXCLUDED.gender, profiles.gender),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, profiles.date_of_birth),
    marital_status = COALESCE(EXCLUDED.marital_status, profiles.marital_status),
    occupation = COALESCE(EXCLUDED.occupation, profiles.occupation),
    address = COALESCE(EXCLUDED.address, profiles.address),
    city = COALESCE(EXCLUDED.city, profiles.city),
    state = COALESCE(EXCLUDED.state, profiles.state),
    zip_code = COALESCE(EXCLUDED.zip_code, profiles.zip_code),
    country = COALESCE(EXCLUDED.country, profiles.country),
    emergency_contact = COALESCE(EXCLUDED.emergency_contact, profiles.emergency_contact),
    emergency_phone = COALESCE(EXCLUDED.emergency_phone, profiles.emergency_phone),
    relationship = COALESCE(EXCLUDED.relationship, profiles.relationship),
    alternate_phone = COALESCE(EXCLUDED.alternate_phone, profiles.alternate_phone),
    is_verified = COALESCE(EXCLUDED.is_verified, profiles.is_verified),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Create CORRECT RLS policies
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow SELECT for checking email availability (needed for registration)
CREATE POLICY "Enable read access for email check"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 2: Allow authenticated users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 5: Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 6: Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- STEP 5: Grant necessary permissions
-- ============================================

-- Grant permissions to anon (for pre-signup checks)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Grant permissions to service_role (for admin operations)
GRANT ALL ON public.profiles TO service_role;

-- ============================================
-- STEP 6: Fix verification_codes table
-- ============================================

-- Ensure verification_codes table exists
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on verification_codes
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on verification_codes
DROP POLICY IF EXISTS "Allow anon to insert codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow anon to select codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow anon to update codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow anon to delete codes" ON public.verification_codes;

-- Create policies for verification_codes
CREATE POLICY "Allow anon to insert codes"
ON public.verification_codes FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to select codes"
ON public.verification_codes FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anon to update codes"
ON public.verification_codes FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anon to delete codes"
ON public.verification_codes FOR DELETE
TO anon
USING (true);

-- Grant permissions on verification_codes
GRANT ALL ON public.verification_codes TO anon;
GRANT ALL ON public.verification_codes TO authenticated;
GRANT ALL ON public.verification_codes TO service_role;

-- ============================================
-- STEP 7: Verify the setup
-- ============================================

-- Check if trigger exists
SELECT 
  'Trigger Status' AS check_type,
  tgname AS trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END AS status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created'
AND tgrelid = 'auth.users'::regclass;

-- Check RLS policies
SELECT 
  'RLS Policies' AS check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- Check table permissions
SELECT 
  'Table Permissions' AS check_type,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- ✅ Trigger Status: on_auth_user_created = Enabled
-- ✅ RLS Policies: 6 policies shown
-- ✅ Table Permissions: anon, authenticated, service_role have access
--
-- After running this script:
-- 1. Clear your browser cache
-- 2. Refresh the page (Ctrl+F5)
-- 3. Try creating a new account
-- 4. It should work! ✅
-- ============================================

SELECT '🎉 DATABASE SETUP COMPLETE! Try registering a new user now.' AS status;

