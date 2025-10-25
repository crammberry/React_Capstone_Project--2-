-- =================================================================
-- FIX ROLE CONSTRAINT & MAKE SUPERADMIN
-- =================================================================
-- This fixes the CHECK CONSTRAINT error and makes you superadmin
-- Run this ENTIRE script in Supabase SQL Editor
-- =================================================================

-- STEP 1: Drop the old role constraint that blocks 'superadmin'
-- =================================================================
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- STEP 2: Add new constraint that allows 'superadmin'
-- =================================================================
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'superadmin'));

-- STEP 3: Now make your account superadmin
-- =================================================================
UPDATE profiles
SET 
  role = 'superadmin',
  is_verified = true,
  updated_at = NOW()
WHERE email = 'amoromonste@gmail.com';

-- STEP 4: Verify it worked
-- =================================================================
SELECT 
  email,
  role,
  is_verified,
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
  SELECT role, is_verified INTO v_role, v_verified
  FROM profiles
  WHERE email = 'amoromonste@gmail.com';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ CONSTRAINT FIXED & SUPERADMIN CREATED! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: amoromonste@gmail.com';
  RAISE NOTICE '⭐ Role: %', v_role;
  RAISE NOTICE '✅ Verified: %', v_verified;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEPS:';
  RAISE NOTICE '1. Clear browser data (Ctrl+Shift+Delete)';
  RAISE NOTICE '2. Logout from your app';
  RAISE NOTICE '3. Login again';
  RAISE NOTICE '4. Look for "⭐ User Management" tab';
  RAISE NOTICE '';
END $$;

