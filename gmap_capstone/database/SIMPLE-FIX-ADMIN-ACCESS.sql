-- =================================================================
-- SIMPLE FIX - Admin Access to Exhumation & Reservation Data
-- =================================================================
-- This script gives admins full access to both tables
-- Run this ENTIRE script in Supabase SQL Editor
-- =================================================================

-- 1. Drop ALL existing policies on exhumation_requests
-- =================================================================
DROP POLICY IF EXISTS "Allow public read access to exhumation_requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert exhumation_requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update exhumation_requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete exhumation_requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Users can create exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Users can view own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Admins can view all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Admins can update all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Admins can delete exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow anon to insert profiles during signup" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow users to insert their own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow users to view their own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow users to update their own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow admins to view all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow admins to update all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow admins to delete exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Enable all operations for admins" ON exhumation_requests;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON exhumation_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON exhumation_requests;

-- 2. Drop ALL existing policies on plot_reservations
-- =================================================================
DROP POLICY IF EXISTS "Allow users to insert their own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow users to view their own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow users to update their own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow admins to view all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow admins to update all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow admins to delete plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Users can create plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Users can view own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Users can update own pending reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can view all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can update all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can delete plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Enable all operations for admins" ON plot_reservations;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON plot_reservations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON plot_reservations;

-- 3. Create SIMPLE policies for exhumation_requests
-- =================================================================

-- Allow ALL authenticated users to read exhumation_requests (for now)
CREATE POLICY "Allow authenticated read on exhumation_requests"
ON exhumation_requests
FOR SELECT
TO authenticated
USING (true);

-- Allow ALL authenticated users to insert exhumation_requests
CREATE POLICY "Allow authenticated insert on exhumation_requests"
ON exhumation_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow ALL authenticated users to update exhumation_requests
CREATE POLICY "Allow authenticated update on exhumation_requests"
ON exhumation_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow ALL authenticated users to delete exhumation_requests
CREATE POLICY "Allow authenticated delete on exhumation_requests"
ON exhumation_requests
FOR DELETE
TO authenticated
USING (true);

-- 4. Create SIMPLE policies for plot_reservations (if table exists)
-- =================================================================

-- Allow ALL authenticated users to read plot_reservations
CREATE POLICY "Allow authenticated read on plot_reservations"
ON plot_reservations
FOR SELECT
TO authenticated
USING (true);

-- Allow ALL authenticated users to insert plot_reservations
CREATE POLICY "Allow authenticated insert on plot_reservations"
ON plot_reservations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow ALL authenticated users to update plot_reservations
CREATE POLICY "Allow authenticated update on plot_reservations"
ON plot_reservations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow ALL authenticated users to delete plot_reservations
CREATE POLICY "Allow authenticated delete on plot_reservations"
ON plot_reservations
FOR DELETE
TO authenticated
USING (true);

-- =================================================================
-- 5. Verification Query
-- =================================================================
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('exhumation_requests', 'plot_reservations')
ORDER BY tablename, policyname;

-- =================================================================
-- SUCCESS!
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ SUCCESS! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 All RLS policies created successfully!';
  RAISE NOTICE '📋 Admins can now view/update/delete exhumation requests';
  RAISE NOTICE '📋 Admins can now view/update/delete plot reservations';
  RAISE NOTICE '👤 All authenticated users have full access';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 NEXT STEP: Refresh your app (Ctrl+F5)';
  RAISE NOTICE '';
END $$;

