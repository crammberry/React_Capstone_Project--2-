-- ============================================================================
-- FIX PLOT_ID COLUMN TYPE IN EXHUMATION_REQUESTS
-- ============================================================================
-- Change plot_id from UUID to VARCHAR to accept plot IDs like "LB-L3-L6"
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Drop the foreign key constraint if it exists
ALTER TABLE exhumation_requests 
DROP CONSTRAINT IF EXISTS exhumation_requests_plot_id_fkey;

-- Change plot_id column type from UUID to VARCHAR
ALTER TABLE exhumation_requests 
ALTER COLUMN plot_id TYPE VARCHAR(50) USING plot_id::VARCHAR;

-- Verify the change
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'exhumation_requests' 
  AND column_name = 'plot_id';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ plot_id column type changed from UUID to VARCHAR(50)!';
  RAISE NOTICE '✅ Exhumation requests can now accept plot IDs like LB-L3-L6';
END $$;

