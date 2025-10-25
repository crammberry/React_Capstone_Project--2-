-- ============================================================================
-- ADD MISSING DOCUMENT COLUMNS TO EXHUMATION_REQUESTS TABLE
-- ============================================================================
-- This adds the document URL columns that are needed for file uploads
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add document URL columns if they don't exist
ALTER TABLE exhumation_requests 
ADD COLUMN IF NOT EXISTS valid_id_url TEXT,
ADD COLUMN IF NOT EXISTS death_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS birth_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS affidavit_url TEXT,
ADD COLUMN IF NOT EXISTS burial_permit_url TEXT;

-- Add requestor info columns if they don't exist
ALTER TABLE exhumation_requests
ADD COLUMN IF NOT EXISTS requestor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS requestor_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS requestor_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS requestor_address TEXT;

-- Add exhumation detail columns if they don't exist
ALTER TABLE exhumation_requests
ADD COLUMN IF NOT EXISTS deceased_date_of_death DATE,
ADD COLUMN IF NOT EXISTS deceased_date_of_burial DATE,
ADD COLUMN IF NOT EXISTS deceased_relationship VARCHAR(100),
ADD COLUMN IF NOT EXISTS reason_for_exhumation TEXT,
ADD COLUMN IF NOT EXISTS preferred_date DATE,
ADD COLUMN IF NOT EXISTS new_location TEXT,
ADD COLUMN IF NOT EXISTS request_type VARCHAR(10) CHECK (request_type IN ('IN', 'OUT'));

-- Add user_id column if it doesn't exist (for RLS)
ALTER TABLE exhumation_requests
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update status check constraint to match new statuses
DO $$ 
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE exhumation_requests DROP CONSTRAINT IF EXISTS exhumation_requests_status_check;
  
  -- Add new constraint
  ALTER TABLE exhumation_requests 
  ADD CONSTRAINT exhumation_requests_status_check 
  CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'pending', 'approved', 'rejected', 'completed'));
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Constraint already exists or error occurred: %', SQLERRM;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exhumation_requests'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Document columns added successfully to exhumation_requests table!';
  RAISE NOTICE '✅ You can now upload documents with burial/exhumation requests';
END $$;

