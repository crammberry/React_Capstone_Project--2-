-- =================================================================
-- MAKE YOUR ACCOUNT SUPERADMIN
-- =================================================================
-- Run this ONCE to make your account the system superadmin
-- Only ONE account should be superadmin for security
-- =================================================================

-- 1. Make your account SUPERADMIN
UPDATE profiles
SET 
  role = 'superadmin',        -- Highest privilege level
  is_verified = true          -- Must be verified
WHERE email = 'amoromonste@gmail.com';

-- 2. Verify it worked
SELECT 
  email,
  role,
  is_verified,
  created_at
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- =================================================================
-- Expected Result:
-- email: amoromonste@gmail.com
-- role: superadmin          ← Should say 'superadmin'
-- is_verified: true         ← Should say 'true'
-- =================================================================

-- =================================================================
-- WHAT IS SUPERADMIN?
-- =================================================================
-- Superadmin is the highest privilege level with special powers:
-- 
-- ✅ Can access ALL admin features
-- ✅ Can access User Management panel
-- ✅ Can promote users to admin
-- ✅ Can demote admins to user
-- ✅ Cannot be modified through the UI
-- ✅ Cannot demote themselves
-- ✅ Protected account (database-only changes)
--
-- Regular admin:
-- - Can manage plots, exhumations, reservations
-- - CANNOT access User Management
-- - CANNOT promote/demote users
--
-- =================================================================

-- =================================================================
-- TO CHANGE SUPERADMIN IN THE FUTURE:
-- =================================================================
-- Run these commands to transfer superadmin to another user:

-- Step 1: Demote current superadmin to admin
-- UPDATE profiles SET role = 'admin' WHERE email = 'old_superadmin@email.com';

-- Step 2: Promote new user to superadmin
-- UPDATE profiles SET role = 'superadmin' WHERE email = 'new_superadmin@email.com';

-- =================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ SUPERADMIN CREATED! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '⭐ Your account is now SUPERADMIN';
  RAISE NOTICE '📧 Email: amoromonste@gmail.com';
  RAISE NOTICE '🔒 Account is protected from UI changes';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEPS:';
  RAISE NOTICE '1. Logout from your app';
  RAISE NOTICE '2. Clear browser data (Ctrl+Shift+Delete)';
  RAISE NOTICE '3. Login again';
  RAISE NOTICE '4. You should see "⭐ User Management" tab';
  RAISE NOTICE '';
END $$;

