-- 🔐 CREATE ADMIN ACCOUNT DIRECTLY IN DATABASE
-- This creates an admin account WITHOUT needing email verification

-- ============================================
-- METHOD 1: Create Admin Account Directly
-- ============================================

-- Step 1: Create auth user (this is the tricky part)
-- Unfortunately, Supabase Auth doesn't allow creating users directly via SQL
-- You MUST use the Supabase Dashboard or API

-- INSTEAD, use Supabase Dashboard:
-- 1. Go to: Authentication → Users
-- 2. Click "Add User"
-- 3. Fill in:
--    Email: admin@eternalmemorial.local
--    Password: YourStrongPassword123!
--    Auto Confirm User: ✅ YES (IMPORTANT!)
-- 4. Click "Create User"

-- Step 2: After creating user in dashboard, run this SQL:
-- Get the user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'admin@eternalmemorial.local';

-- Step 3: Create/Update profile as admin
-- Replace 'USER_ID_HERE' with the ID from Step 2
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
  'USER_ID_HERE',  -- Replace with actual UUID from Step 2
  'admin@eternalmemorial.local',
  'admin',
  'System',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_verified = true;

-- ============================================
-- METHOD 2: Upgrade Existing User to Admin
-- ============================================

-- If you already have a user account (even without email verification)
-- Just upgrade it to admin:

-- View all users
SELECT 
  p.id,
  p.email,
  p.role,
  p.is_verified,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Upgrade any user to admin (replace email)
UPDATE profiles
SET 
  role = 'admin',
  is_verified = true
WHERE email = 'amoromonste@gmail.com';  -- Your existing account

-- Verify
SELECT * FROM profiles WHERE role = 'admin';

-- ============================================
-- RECOMMENDED APPROACH:
-- ============================================

-- EASIEST METHOD:
-- 1. Use Supabase Dashboard to create user
-- 2. Enable "Auto Confirm User" checkbox
-- 3. User is created WITHOUT needing email verification
-- 4. Run SQL to upgrade to admin
-- 5. Login immediately

-- ============================================
-- NOTES:
-- ============================================
-- - You CANNOT create auth.users directly via SQL (security restriction)
-- - You MUST use Supabase Dashboard or Admin API
-- - Once user is created, you CAN upgrade to admin via SQL
-- - "Auto Confirm User" bypasses email verification
-- - Perfect for local/test admin accounts



