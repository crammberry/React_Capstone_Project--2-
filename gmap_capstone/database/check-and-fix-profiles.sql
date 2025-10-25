-- CHECK AND FIX PROFILES TABLE
-- Run this in Supabase SQL Editor to diagnose and fix the issue

-- Step 1: Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) AS profiles_table_exists;

-- Step 2: Check if your user has a profile
SELECT * FROM profiles 
WHERE id = '28fe7414-fa68-4641-a48a-f9dac4d066b7';

-- Step 3: Check all profiles in the table
SELECT id, email, role, is_verified, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Step 4: If no profile exists, create one for your user
-- Replace the UUID with your actual user ID from auth.users
INSERT INTO profiles (
  id,
  email,
  role,
  first_name,
  last_name,
  contact_number,
  city,
  zip_code,
  is_verified,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'user' as role,
  'User' as first_name,
  'Name' as last_name,
  '0000000000' as contact_number,
  'City' as city,
  '0000' as zip_code,
  true as is_verified,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE id = '28fe7414-fa68-4641-a48a-f9dac4d066b7'
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify the profile was created
SELECT * FROM profiles 
WHERE id = '28fe7414-fa68-4641-a48a-f9dac4d066b7';

-- Step 6: Create trigger to auto-create profiles for future users
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    role,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- NOTES:
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Check the results of each query
-- 3. If Step 2 returns no rows, your profile is missing
-- 4. Step 4 will create the missing profile
-- 5. Step 6 ensures future users get profiles automatically



