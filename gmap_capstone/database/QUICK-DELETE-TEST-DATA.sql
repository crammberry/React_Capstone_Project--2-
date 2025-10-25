-- =================================================================
-- QUICK DELETE - Remove ALL Test Data (No Checks)
-- =================================================================
-- This is the simplest version - just deletes everything
-- Use this if you just want to clean up quickly
-- =================================================================

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
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ QUICK DELETE COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🏺 Exhumation Requests: %', v_exhumation_count;
  RAISE NOTICE '🏷️ Plot Reservations: %', v_reservation_count;
  RAISE NOTICE '';
  
  IF v_exhumation_count = 0 AND v_reservation_count = 0 THEN
    RAISE NOTICE '🎉 All test data removed!';
  ELSE
    RAISE WARNING '⚠️ Some data remains';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;

