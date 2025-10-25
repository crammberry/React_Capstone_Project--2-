-- AUTO-CONFIRM ALL NEW USERS
-- This will automatically confirm email for all new users since you use custom verification

-- Step 1: Create a function to auto-confirm users
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set email as confirmed when user is created
  -- Note: confirmed_at is a generated column, only set email_confirmed_at
  NEW.email_confirmed_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create trigger to run on new user creation
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- Step 4: Also confirm any existing unconfirmed users
-- Note: confirmed_at is a generated column, only update email_confirmed_at
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Step 5: Verify the setup
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- NOTES:
-- 1. This will auto-confirm ALL new users on registration
-- 2. Your custom 6-digit verification system will still work
-- 3. This prevents the "email not confirmed" error
-- 4. Run this ONCE in Supabase SQL Editor
-- 5. confirmed_at is auto-generated based on email_confirmed_at

