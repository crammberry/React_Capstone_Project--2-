-- DELETE USER AND RESET SYSTEM
-- Run this in Supabase SQL Editor to fix loading issues

-- First, delete from profiles table
DELETE FROM public.profiles WHERE email = 'your-email@example.com';

-- Then delete from auth.users table (if you have access)
-- Note: You might need to do this from Supabase Dashboard > Authentication > Users
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';

-- Alternative: Just delete from profiles (this should be enough)
-- Replace 'your-email@example.com' with your actual email address




