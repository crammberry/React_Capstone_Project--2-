-- 🔐 CREATE ADMIN ACCOUNT
-- Run this to upgrade your current account to admin

-- Step 1: Upgrade your account to admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'amoromonste@gmail.com';

-- Step 2: Verify admin account
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  is_verified,
  created_at
FROM profiles
WHERE email = 'amoromonste@gmail.com';

-- Step 3: View all admin users
SELECT 
  id,
  email,
  role,
  is_verified
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- NOTES:
-- ============================================
-- After running this:
-- 1. Logout from your account
-- 2. Clear browser cache: localStorage.clear(); location.reload();
-- 3. Login again
-- 4. You should be redirected to /admin
-- 5. Admin Dashboard will be accessible



