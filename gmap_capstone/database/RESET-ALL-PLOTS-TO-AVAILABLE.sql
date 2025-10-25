-- =================================================================
-- RESET ALL PLOTS TO AVAILABLE STATE
-- =================================================================
-- This script will:
-- 1. Show current plot data
-- 2. Reset ALL plots to "available" status
-- 3. Clear occupant data from all plots
-- =================================================================

-- =================================================================
-- STEP 1: CHECK CURRENT PLOT DATA
-- =================================================================

-- Show all occupied or reserved plots
SELECT 
  '📊 Current Non-Available Plots:' as info,
  plot_id,
  section,
  level,
  status,
  occupant_name
FROM plots
WHERE status != 'available'
ORDER BY section, level, plot_number;

-- Count plots by status
SELECT 
  '📈 Plot Status Summary:' as info,
  status,
  COUNT(*) as count
FROM plots
GROUP BY status
ORDER BY status;

-- =================================================================
-- STEP 2: RESET ALL PLOTS TO AVAILABLE
-- =================================================================

-- Update all plots to available status and clear occupant data
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
-- STEP 3: VERIFY RESET
-- =================================================================

DO $$
DECLARE
  v_total_plots INTEGER;
  v_available_plots INTEGER;
  v_occupied_plots INTEGER;
  v_reserved_plots INTEGER;
BEGIN
  -- Count plots by status
  SELECT COUNT(*) INTO v_total_plots FROM plots;
  SELECT COUNT(*) INTO v_available_plots FROM plots WHERE status = 'available';
  SELECT COUNT(*) INTO v_occupied_plots FROM plots WHERE status = 'occupied';
  SELECT COUNT(*) INTO v_reserved_plots FROM plots WHERE status = 'reserved';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ PLOT RESET COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total Plots: %', v_total_plots;
  RAISE NOTICE '✅ Available: %', v_available_plots;
  RAISE NOTICE '🔴 Occupied: %', v_occupied_plots;
  RAISE NOTICE '🟡 Reserved: %', v_reserved_plots;
  RAISE NOTICE '';
  
  IF v_available_plots = v_total_plots THEN
    RAISE NOTICE '🎉 SUCCESS! All plots reset to available!';
    RAISE NOTICE '   You now have a clean cemetery with % empty plots.', v_total_plots;
  ELSE
    RAISE WARNING '⚠️ Some plots still not available:';
    RAISE WARNING '   Occupied: %, Reserved: %', v_occupied_plots, v_reserved_plots;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Show final status summary
SELECT 
  '📋 Final Status Summary:' as info,
  status,
  COUNT(*) as count
FROM plots
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'available' THEN 1
    WHEN 'reserved' THEN 2
    WHEN 'occupied' THEN 3
    ELSE 4
  END;

