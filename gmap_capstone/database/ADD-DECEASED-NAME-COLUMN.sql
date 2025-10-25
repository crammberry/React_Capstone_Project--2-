-- ============================================================================
-- ADD DECEASED_NAME COLUMN TO EXHUMATION_REQUESTS TABLE
-- ============================================================================
-- This adds the missing deceased_name column
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add deceased_name column if it doesn't exist
ALTER TABLE exhumation_requests 
ADD COLUMN IF NOT EXISTS deceased_name VARCHAR(255);

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'exhumation_requests' 
  AND column_name = 'deceased_name';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ deceased_name column added successfully to exhumation_requests table!';
END $$;

