-- 🔐 RESET ADMIN PASSWORD
-- Run this in Supabase SQL Editor to reset your admin password

-- ============================================
-- OPTION 1: Check if you have an admin account
-- ============================================

-- View all admin accounts
SELECT 
  id,
  email,
  role,
  is_verified,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- OPTION 2: Reset Password via Supabase Dashboard
-- ============================================

-- Unfortunately, you can't reset passwords directly via SQL
-- Supabase manages passwords securely in auth.users

-- INSTEAD, use Supabase Dashboard:
-- 1. Go to: Authentication → Users
-- 2. Find your admin account
-- 3. Click "..." menu
-- 4. Click "Reset Password"
-- 5. Check your email for reset link

-- ============================================
-- OPTION 3: Delete and Recreate Admin Account
-- ============================================

-- If you can't reset password, create a NEW admin account:

-- Step 1: First, register a NEW account through the UI with a new email
--         (e.g., admin-new@eternalmemorial.com)

-- Step 2: Run this SQL to upgrade the new account to admin:
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'your-new-email@example.com';

-- Step 3: Verify
-- SELECT * FROM profiles WHERE role = 'admin';

-- ============================================
-- OPTION 4: Temporary Password Reset (Advanced)
-- ============================================

-- If you have access to Supabase Service Role Key:
-- Use Supabase Admin API to update user password

-- In Supabase Dashboard:
-- 1. Go to Settings → API
-- 2. Copy Service Role Key (secret!)
-- 3. Use Supabase Admin API to reset password

-- ============================================
-- RECOMMENDED SOLUTION:
-- ============================================

-- 1. Go to Supabase Dashboard
-- 2. Authentication → Users
-- 3. Find admin user by email
-- 4. Click three dots "..."
-- 5. Click "Reset Password"
-- 6. Check email for reset link
-- 7. Set new password

-- OR

-- 1. Register a new account through your app
-- 2. Upgrade it to admin using SQL:
--    UPDATE profiles SET role = 'admin' WHERE email = 'new@email.com';
-- 3. Login with new admin account



