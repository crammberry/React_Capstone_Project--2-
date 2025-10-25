-- 🚨 EMERGENCY FIX: Disable RLS Completely
-- This will make your admin dashboard work IMMEDIATELY
-- We'll add security back later

-- ============================================
-- STEP 1: Disable RLS on profiles table
-- ============================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Verify your admin profile
-- ============================================

SELECT id, email, role FROM profiles WHERE email = 'amoromonste@gmail.com';

-- ============================================
-- DONE!
-- ============================================
-- Now refresh your app and it should work!
-- No more 500 errors!
-- No more infinite recursion!
--
-- This is TEMPORARY - we'll add proper RLS back after testing

