-- MANUALLY CONFIRM USER ACCOUNT
-- This SQL script will manually confirm your user account so you can log in

-- Step 1: Confirm the user account (replace with your email)
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'amoromonste@gmail.com';

-- Step 2: Verify the user is confirmed (check results)
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'amoromonste@gmail.com';

-- Step 3: Update profile to verified (if needed)
UPDATE profiles
SET is_verified = true
WHERE email = 'amoromonste@gmail.com';

-- NOTES:
-- 1. Run this in Supabase SQL Editor
-- 2. Replace 'amoromonste@gmail.com' with your actual email
-- 3. After running, try logging in again
-- 4. This is a temporary fix until you disable email confirmation in settings



