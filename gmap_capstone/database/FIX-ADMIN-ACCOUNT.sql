-- =================================================================
-- FIX ADMIN ACCOUNT - Set User as Admin & Verified
-- =================================================================
-- This script will fix your admin account that's stuck in "pending"
-- Run this in Supabase SQL Editor
-- =================================================================

-- 1. First, let's see the current state of your account
SELECT 
  id,
  email,
  role,
  is_verified,
  created_at
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- =================================================================
-- 2. Fix your account - Set as ADMIN and VERIFIED
-- =================================================================

UPDATE profiles
SET 
  role = 'admin',
  is_verified = true,
  updated_at = NOW()
WHERE email = 'amoromonste@gmail.com';

-- =================================================================
-- 3. Verify the fix worked
-- =================================================================

SELECT 
  id,
  email,
  role,
  is_verified,
  full_name,
  created_at,
  updated_at
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================
DO $$
DECLARE
  v_role TEXT;
  v_verified BOOLEAN;
BEGIN
  -- Get the current values
  SELECT role, is_verified INTO v_role, v_verified
  FROM profiles
  WHERE email = 'amoromonste@gmail.com';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ ADMIN ACCOUNT FIXED! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: amoromonste@gmail.com';
  RAISE NOTICE '👑 Role: %', v_role;
  RAISE NOTICE '✅ Verified: %', v_verified;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEPS:';
  RAISE NOTICE '1. Logout from your app';
  RAISE NOTICE '2. Login again';
  RAISE NOTICE '3. You should now see "Admin Mode" in the header';
  RAISE NOTICE '';
END $$;

