-- =================================================================
-- INSTANT FIX - Make Your Account Admin RIGHT NOW
-- =================================================================
-- Copy this ENTIRE script and run it in Supabase SQL Editor
-- =================================================================

-- Fix your account - Change these 2 fields:
UPDATE profiles
SET 
  role = 'admin',           -- Change from 'user' to 'admin'
  is_verified = true        -- Change from false to true
WHERE email = 'amoromonste@gmail.com';

-- Check if it worked:
SELECT 
  email,
  role,
  is_verified
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- =================================================================
-- You should see:
-- email: amoromonste@gmail.com
-- role: admin          ← Should say 'admin'
-- is_verified: true    ← Should say 'true'
-- =================================================================

