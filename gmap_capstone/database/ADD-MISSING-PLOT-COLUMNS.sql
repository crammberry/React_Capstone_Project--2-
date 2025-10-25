-- ===============================================================================
-- ADD MISSING COLUMNS TO PLOTS TABLE
-- ===============================================================================
-- This script adds all missing columns needed for the admin plot edit form
-- Run this in your Supabase SQL Editor
-- ===============================================================================

-- Add missing columns to plots table (if they don't exist)
DO $$ 
BEGIN
  -- Date of birth
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'date_of_birth') THEN
    ALTER TABLE plots ADD COLUMN date_of_birth DATE;
  END IF;

  -- Date of death
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'date_of_death') THEN
    ALTER TABLE plots ADD COLUMN date_of_death DATE;
  END IF;

  -- Date of burial
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'date_of_burial') THEN
    ALTER TABLE plots ADD COLUMN date_of_burial DATE;
  END IF;

  -- Age at death
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'age') THEN
    ALTER TABLE plots ADD COLUMN age INTEGER;
  END IF;

  -- Religion
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'religion') THEN
    ALTER TABLE plots ADD COLUMN religion VARCHAR(100);
  END IF;

  -- Cause of death
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'cause_of_death') THEN
    ALTER TABLE plots ADD COLUMN cause_of_death TEXT;
  END IF;

  -- Family name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'family_name') THEN
    ALTER TABLE plots ADD COLUMN family_name VARCHAR(255);
  END IF;

  -- Next of kin
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'next_of_kin') THEN
    ALTER TABLE plots ADD COLUMN next_of_kin VARCHAR(255);
  END IF;

  -- Phone number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'phone') THEN
    ALTER TABLE plots ADD COLUMN phone VARCHAR(50);
  END IF;

  -- Address (TEXT type - no restrictions, can be any length or format)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'address') THEN
    ALTER TABLE plots ADD COLUMN address TEXT;
  END IF;

  -- Notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plots' AND column_name = 'notes') THEN
    ALTER TABLE plots ADD COLUMN notes TEXT;
  END IF;

END $$;

-- ===============================================================================
-- VERIFICATION
-- ===============================================================================
-- Check all columns in plots table
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'plots'
ORDER BY ordinal_position;

-- ===============================================================================
-- SUCCESS MESSAGE
-- ===============================================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ All missing columns have been added to the plots table!';
  RAISE NOTICE '📝 Address column is TEXT type - no length or format restrictions';
  RAISE NOTICE '🔄 You can now use the admin plot edit form without errors';
END $$;

