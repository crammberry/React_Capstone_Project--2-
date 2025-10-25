-- 🚨 EMERGENCY FIX - Make amoromonste@gmail.com Admin
-- Run this ENTIRE script in Supabase SQL Editor

-- This will:
-- 1. Find your user ID
-- 2. Delete any incorrect profile
-- 3. Create a new correct profile with admin role
-- 4. Verify everything works

-- ============================================
-- STEP 1: Create or replace profile as admin
-- ============================================

-- Delete any existing profile first (to avoid conflicts)
DELETE FROM profiles WHERE email = 'amoromonste@gmail.com';

-- Create new profile with correct UUID from auth.users
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
SELECT 
  u.id,
  u.email,
  'admin' as role,
  'Admin' as first_name,
  'User' as last_name,
  true as is_verified,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE u.email = 'amoromonste@gmail.com';

-- ============================================
-- STEP 2: Verify it worked
-- ============================================

-- This should return 1 row with role = 'admin'
SELECT 
  p.id,
  p.email,
  p.role,
  p.is_verified,
  p.first_name,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'amoromonste@gmail.com';

-- ============================================
-- EXPECTED RESULT:
-- ============================================
-- id: [some UUID matching auth.users]
-- email: amoromonste@gmail.com
-- role: admin  ← MUST BE 'admin'
-- is_verified: true
-- first_name: Admin
-- email_confirmed_at: [some timestamp]

-- If you see this result, the fix worked! ✅
-- Now logout, clear cache, and login again.



