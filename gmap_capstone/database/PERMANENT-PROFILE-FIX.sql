-- ✅ PERMANENT FIX FOR ALL USERS (Current + Future)
-- This will fix your current account AND automatically create profiles for all future users

-- ============================================
-- PART 1: Fix Your Current Account
-- ============================================

-- Create/Update profile for your current account
INSERT INTO profiles (
  id,
  email,
  role,
  first_name,
  last_name,
  is_verified,
  created_at,
  updated_at
)
VALUES (
  '28fe7414-fa68-4641-a48a-f9dac4d066b7',
  'amoromonste@gmail.com',
  'user',
  'User',
  'Name',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  is_verified = true,
  updated_at = NOW();

-- ============================================
-- PART 2: Fix ALL Existing Users Without Profiles
-- ============================================

-- Create profiles for any existing auth users who don't have profiles yet
INSERT INTO profiles (
  id,
  email,
  role,
  is_verified,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  'user' as role,
  true as is_verified,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 3: Auto-Create Profiles for ALL Future Users
-- ============================================

-- Create function to automatically create profile when user signs up
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

-- Create trigger that runs AFTER a new user is inserted
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- ============================================
-- PART 4: Verification
-- ============================================

-- Check how many users now have profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN profiles p ON u.id = p.id WHERE p.id IS NULL) as users_without_profiles;

-- Show all profiles
SELECT 
  id,
  email,
  role,
  is_verified,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- NOTES:
-- ============================================
-- 1. This script is SAFE to run multiple times (uses ON CONFLICT)
-- 2. Part 1: Fixes YOUR account immediately
-- 3. Part 2: Fixes ALL existing users without profiles
-- 4. Part 3: Creates profiles automatically for ALL future users
-- 5. Part 4: Shows verification that everything worked
-- 
-- After running this:
-- - Your account will work immediately
-- - All existing users will have profiles
-- - All future registrations will auto-create profiles
-- - No more hanging database queries



