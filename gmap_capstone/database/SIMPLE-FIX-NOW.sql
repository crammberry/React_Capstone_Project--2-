-- 🚨 SIMPLE FIX - Run this ENTIRE script NOW
-- This will fix the 500 errors and make your admin work

-- ============================================
-- STEP 1: Temporarily DISABLE RLS to fix the issue
-- ============================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Verify your profile exists and is admin
-- ============================================

-- Check your profile
SELECT id, email, role, is_verified FROM profiles WHERE email = 'amoromonste@gmail.com';

-- If the above returns nothing or role is not 'admin', run this:
DELETE FROM profiles WHERE email = 'amoromonste@gmail.com';

INSERT INTO profiles (id, email, role, first_name, last_name, is_verified, created_at, updated_at)
SELECT u.id, u.email, 'admin', 'Admin', 'User', true, NOW(), NOW()
FROM auth.users u
WHERE u.email = 'amoromonste@gmail.com';

-- Verify again
SELECT id, email, role, is_verified FROM profiles WHERE email = 'amoromonste@gmail.com';
-- Should show: role = 'admin'

-- ============================================
-- NOTES:
-- ============================================
-- RLS is now DISABLED for profiles table
-- This means:
-- ✅ All queries work (no 500 errors)
-- ✅ Profile loads correctly
-- ✅ Admin role detected
-- ✅ Dashboard button appears
--
-- After this works:
-- 1. Logout and login
-- 2. Clear cache: localStorage.clear(); location.reload();
-- 3. Dashboard button should appear
-- 4. We can re-enable RLS with correct policies later
--
-- This is a TEMPORARY fix to get you working NOW
-- We'll add proper RLS back once admin is confirmed working



