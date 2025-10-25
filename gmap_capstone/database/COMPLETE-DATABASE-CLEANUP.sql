-- =================================================================
-- COMPLETE DATABASE CLEANUP - Reset Everything to Fresh State
-- =================================================================
-- This script will:
-- 1. Delete all exhumation requests
-- 2. Delete all plot reservations
-- 3. Reset all plots to available
-- 4. Clear all test data
-- =================================================================

-- =================================================================
-- STEP 1: DELETE ALL EXHUMATION REQUESTS
-- =================================================================

DELETE FROM exhumation_requests;

-- =================================================================
-- STEP 2: DELETE ALL PLOT RESERVATIONS
-- =================================================================

DELETE FROM plot_reservations;

-- =================================================================
-- STEP 3: RESET ALL PLOTS TO AVAILABLE
-- =================================================================

UPDATE plots
SET 
  status = 'available',
  occupant_name = NULL,
  age = NULL,
  cause_of_death = NULL,
  religion = NULL,
  family_name = NULL,
  next_of_kin = NULL,
  contact_number = NULL,
  date_of_interment = NULL,
  notes = NULL,
  updated_at = NOW()
WHERE status != 'available';

-- =================================================================
-- STEP 4: VERIFY COMPLETE CLEANUP
-- =================================================================

DO $$
DECLARE
  v_exhumation_count INTEGER;
  v_reservation_count INTEGER;
  v_total_plots INTEGER;
  v_available_plots INTEGER;
  v_occupied_plots INTEGER;
  v_reserved_plots INTEGER;
BEGIN
  -- Count all records
  SELECT COUNT(*) INTO v_exhumation_count FROM exhumation_requests;
  SELECT COUNT(*) INTO v_reservation_count FROM plot_reservations;
  SELECT COUNT(*) INTO v_total_plots FROM plots;
  SELECT COUNT(*) INTO v_available_plots FROM plots WHERE status = 'available';
  SELECT COUNT(*) INTO v_occupied_plots FROM plots WHERE status = 'occupied';
  SELECT COUNT(*) INTO v_reserved_plots FROM plots WHERE status = 'reserved';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅✅✅ COMPLETE DATABASE CLEANUP SUCCESSFUL! ✅✅✅';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  DATA DELETED:';
  RAISE NOTICE '   🏺 Exhumation Requests: % (should be 0)', v_exhumation_count;
  RAISE NOTICE '   🏷️  Plot Reservations: % (should be 0)', v_reservation_count;
  RAISE NOTICE '';
  RAISE NOTICE '🏗️  PLOTS RESET:';
  RAISE NOTICE '   📊 Total Plots: %', v_total_plots;
  RAISE NOTICE '   ✅ Available: %', v_available_plots;
  RAISE NOTICE '   🔴 Occupied: %', v_occupied_plots;
  RAISE NOTICE '   🟡 Reserved: %', v_reserved_plots;
  RAISE NOTICE '';
  
  IF v_exhumation_count = 0 AND v_reservation_count = 0 AND v_available_plots = v_total_plots THEN
    RAISE NOTICE '🎉 PERFECT! Your database is now completely clean:';
    RAISE NOTICE '';
    RAISE NOTICE '   ✅ No exhumation requests';
    RAISE NOTICE '   ✅ No plot reservations';
    RAISE NOTICE '   ✅ All % plots are available', v_total_plots;
    RAISE NOTICE '';
    RAISE NOTICE '   Your cemetery management system is ready for production!';
    RAISE NOTICE '   Fresh start with zero test data. 🚀';
  ELSE
    RAISE WARNING '⚠️ Cleanup incomplete:';
    IF v_exhumation_count > 0 THEN
      RAISE WARNING '   - Still % exhumation requests remaining', v_exhumation_count;
    END IF;
    IF v_reservation_count > 0 THEN
      RAISE WARNING '   - Still % plot reservations remaining', v_reservation_count;
    END IF;
    IF v_occupied_plots > 0 OR v_reserved_plots > 0 THEN
      RAISE WARNING '   - Still % occupied and % reserved plots', v_occupied_plots, v_reserved_plots;
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

