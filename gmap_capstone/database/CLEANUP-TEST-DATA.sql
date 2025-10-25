-- =================================================================
-- CLEANUP TEST/DUMMY DATA
-- =================================================================
-- This script removes any test exhumation or reservation data
-- Run this to start fresh with a clean database
-- =================================================================

-- =================================================================
-- CHECK CURRENT DATA BEFORE DELETION
-- =================================================================

-- Show all exhumation requests (using only guaranteed columns)
SELECT 
  '📋 Current Exhumation Requests:' as info,
  id,
  created_at,
  plot_id,
  status
FROM exhumation_requests
ORDER BY created_at DESC;

-- Show all plot reservations (using only guaranteed columns)
SELECT 
  '🏷️ Current Plot Reservations:' as info,
  id,
  created_at,
  plot_id,
  status
FROM plot_reservations
ORDER BY created_at DESC;

-- =================================================================
-- DELETE ALL TEST DATA
-- =================================================================

-- WARNING: This will delete ALL exhumation requests and plot reservations
-- Comment out the lines below if you want to keep some data

-- Delete all exhumation requests
DELETE FROM exhumation_requests;

-- Delete all plot reservations
DELETE FROM plot_reservations;

-- =================================================================
-- VERIFY DELETION
-- =================================================================

DO $$
DECLARE
  v_exhumation_count INTEGER;
  v_reservation_count INTEGER;
BEGIN
  -- Count remaining records
  SELECT COUNT(*) INTO v_exhumation_count FROM exhumation_requests;
  SELECT COUNT(*) INTO v_reservation_count FROM plot_reservations;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ TEST DATA CLEANUP COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🏺 Exhumation Requests: % (should be 0)', v_exhumation_count;
  RAISE NOTICE '🏷️ Plot Reservations: % (should be 0)', v_reservation_count;
  RAISE NOTICE '';
  
  IF v_exhumation_count = 0 AND v_reservation_count = 0 THEN
    RAISE NOTICE '🎉 SUCCESS! All test data removed.';
    RAISE NOTICE '   Your database is now clean and ready for production.';
  ELSE
    RAISE WARNING '⚠️ Some data still remains. Check your database.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

