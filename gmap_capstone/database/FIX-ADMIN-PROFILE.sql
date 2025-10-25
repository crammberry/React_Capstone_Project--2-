-- 🔧 FIX ADMIN PROFILE - Complete Solution
-- This will diagnose and fix your admin profile issue

-- ============================================
-- STEP 1: Check if profile exists
-- ============================================

-- Check your user in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'amoromonste@gmail.com';

-- Copy the 'id' (UUID) from the result above, you'll need it!

-- ============================================
-- STEP 2: Check if profile exists in profiles table
-- ============================================

-- Check profile in profiles table
SELECT 
  id,
  email,
  role,
  is_verified,
  first_name,
  last_name,
  created_at
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- If this returns NO ROWS, your profile is missing! (This is likely the issue)

-- ============================================
-- STEP 3: Fix - Create/Update profile with correct UUID
-- ============================================

-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with the UUID from Step 1
-- Example: '28fe7414-fa68-4641-a48a-f9dac4d066b7'

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
  '28fe7414-fa68-4641-a48a-f9dac4d066b7',  -- Replace with your actual UUID from Step 1
  'amoromonste@gmail.com',
  'admin',
  'Admin',
  'User',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_verified = true,
  updated_at = NOW();

-- ============================================
-- STEP 4: Verify the fix
-- ============================================

-- Check if profile now exists
SELECT 
  p.id,
  p.email,
  p.role,
  p.is_verified,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'amoromonste@gmail.com';

-- Expected result:
-- id: (should match auth.users id)
-- email: amoromonste@gmail.com
-- role: admin
-- is_verified: true
-- email_confirmed_at: (should have a timestamp)

-- ============================================
-- STEP 5: Check all users and their profiles
-- ============================================

-- View all users and their profiles
SELECT 
  u.id as auth_id,
  u.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role,
  p.is_verified
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Look for mismatches:
-- - If auth_id ≠ profile_id → Profile has wrong ID
-- - If profile_id is NULL → Profile doesn't exist
-- - If role is not 'admin' → Role not set correctly

-- ============================================
-- NOTES:
-- ============================================
-- Common issue: Profile ID doesn't match auth.users ID
-- This happens if profile was created manually without proper UUID
-- 
-- After running this script:
-- 1. Logout completely
-- 2. Clear cache: localStorage.clear(); location.reload();
-- 3. Login again (regular login tab)
-- 4. Check console for role
-- 5. Should see "Dashboard" button



