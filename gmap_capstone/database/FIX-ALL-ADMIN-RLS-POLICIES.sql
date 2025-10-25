-- =================================================================
-- FIX ALL ADMIN RLS POLICIES FOR EXHUMATION AND RESERVATION SYSTEMS
-- =================================================================
-- Run this SQL script in your Supabase SQL Editor to fix all bugs
-- This script will allow admins to access exhumation_requests and plot_reservations tables
--
-- IMPORTANT: Run this ENTIRE script in one go!
-- =================================================================

-- 1. Enable RLS on both tables (if not already enabled)
ALTER TABLE exhumation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_reservations ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to insert their own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow users to view their own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow users to update their own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow admins to view all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow admins to update all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Allow admins to delete exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Enable all operations for admins" ON exhumation_requests;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON exhumation_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON exhumation_requests;

DROP POLICY IF EXISTS "Allow users to insert their own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow users to view their own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow users to update their own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow admins to view all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow admins to update all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Allow admins to delete plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Enable all operations for admins" ON plot_reservations;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON plot_reservations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON plot_reservations;

-- =================================================================
-- 3. CREATE EXHUMATION_REQUESTS RLS POLICIES
-- =================================================================

-- Drop additional policies that might exist
DROP POLICY IF EXISTS "Users can create exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Users can view own exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Admins can view all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Admins can update all exhumation requests" ON exhumation_requests;
DROP POLICY IF EXISTS "Admins can delete exhumation requests" ON exhumation_requests;

-- Allow authenticated users to INSERT their own exhumation requests
CREATE POLICY "Users can create exhumation requests"
ON exhumation_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to VIEW their own exhumation requests (by email)
CREATE POLICY "Users can view own exhumation requests"
ON exhumation_requests
FOR SELECT
TO authenticated
USING (requestor_email = auth.jwt()->>'email');

-- Allow users to UPDATE their own exhumation requests (only if pending)
CREATE POLICY "Users can update own pending requests"
ON exhumation_requests
FOR UPDATE
TO authenticated
USING (
  requestor_email = auth.jwt()->>'email' 
  AND status = 'pending'
)
WITH CHECK (
  requestor_email = auth.jwt()->>'email' 
  AND status = 'pending'
);

-- Allow ADMINS to SELECT all exhumation requests
CREATE POLICY "Admins can view all exhumation requests"
ON exhumation_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
);

-- Allow ADMINS to UPDATE all exhumation requests
CREATE POLICY "Admins can update all exhumation requests"
ON exhumation_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
);

-- Allow ADMINS to DELETE exhumation requests
CREATE POLICY "Admins can delete exhumation requests"
ON exhumation_requests
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
);

-- =================================================================
-- 4. CREATE PLOT_RESERVATIONS RLS POLICIES
-- =================================================================

-- Drop additional policies that might exist
DROP POLICY IF EXISTS "Users can create plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Users can view own plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Users can update own pending reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can view all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can update all plot reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can delete plot reservations" ON plot_reservations;

-- Allow authenticated users to INSERT their own plot reservations
CREATE POLICY "Users can create plot reservations"
ON plot_reservations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to VIEW their own plot reservations (by email)
CREATE POLICY "Users can view own plot reservations"
ON plot_reservations
FOR SELECT
TO authenticated
USING (contact_email = auth.jwt()->>'email');

-- Allow users to UPDATE their own plot reservations (only if pending)
CREATE POLICY "Users can update own pending reservations"
ON plot_reservations
FOR UPDATE
TO authenticated
USING (
  contact_email = auth.jwt()->>'email' 
  AND status = 'pending'
)
WITH CHECK (
  contact_email = auth.jwt()->>'email' 
  AND status = 'pending'
);

-- Allow ADMINS to SELECT all plot reservations
CREATE POLICY "Admins can view all plot reservations"
ON plot_reservations
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
);

-- Allow ADMINS to UPDATE all plot reservations
CREATE POLICY "Admins can update all plot reservations"
ON plot_reservations
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
);

-- Allow ADMINS to DELETE plot reservations
CREATE POLICY "Admins can delete plot reservations"
ON plot_reservations
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE id IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
);

-- =================================================================
-- 5. VERIFICATION: Check if policies were created successfully
-- =================================================================

-- Run this to see all policies on exhumation_requests
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('exhumation_requests', 'plot_reservations')
ORDER BY tablename, policyname;

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All RLS policies created successfully!';
  RAISE NOTICE '📋 Admins can now view/update/delete exhumation requests';
  RAISE NOTICE '📋 Admins can now view/update/delete plot reservations';
  RAISE NOTICE '👤 Users can view/create their own requests';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Please refresh your app (Ctrl+F5) to see the changes!';
END $$;

