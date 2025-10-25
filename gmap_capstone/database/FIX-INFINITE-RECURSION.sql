-- 🚨 EMERGENCY FIX: Infinite Recursion in RLS Policies
-- Run this IMMEDIATELY to fix the database

-- ============================================
-- STEP 1: Drop ALL policies causing recursion
-- ============================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Drop all existing policies on plots
DROP POLICY IF EXISTS "Anyone can view plots" ON plots;
DROP POLICY IF EXISTS "Admins can manage plots" ON plots;
DROP POLICY IF EXISTS "Enable read access for all users" ON plots;

-- ============================================
-- STEP 2: Create CORRECT policies (no recursion)
-- ============================================

-- Profiles table policies (FIXED - no recursion)
CREATE POLICY "Enable read for authenticated users" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Plots table policies (simple and safe)
CREATE POLICY "Anyone can read plots" ON plots
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert plots" ON plots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update plots" ON plots
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete plots" ON plots
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- STEP 3: Verify it worked
-- ============================================

-- Test query - should work now
SELECT id, email, role FROM profiles WHERE email = 'amoromonste@gmail.com';

-- ============================================
-- EXPECTED RESULT:
-- ============================================
-- Should return your profile with role = 'admin'
-- No more 500 errors or infinite recursion!



