-- ============================================================================
-- CREATE PLOT_RESERVATIONS TABLE
-- ============================================================================
-- This creates the plot_reservations table with all necessary columns
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Create plot_reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS plot_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User & Plot Info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plot_id VARCHAR(50) NOT NULL,
  
  -- Reservation Type
  reservation_type VARCHAR(20) NOT NULL CHECK (reservation_type IN (
    'PRE_NEED',      -- Buying plot in advance
    'IMMEDIATE',     -- Immediate burial need
    'TRANSFER'       -- Transferring ownership
  )),
  
  -- Beneficiary Info (who the plot is for)
  beneficiary_name VARCHAR(255),
  beneficiary_relationship VARCHAR(100),
  is_for_self BOOLEAN DEFAULT false,
  
  -- Requestor Info
  requestor_name VARCHAR(255) NOT NULL,
  requestor_email VARCHAR(255) NOT NULL,
  requestor_phone VARCHAR(50) NOT NULL,
  requestor_address TEXT NOT NULL,
  
  -- Documents
  valid_id_url TEXT NOT NULL,
  proof_of_relationship_url TEXT,
  additional_documents JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'APPROVED',
    'PAID',
    'ACTIVE',
    'EXPIRED',
    'CANCELLED',
    'REJECTED'
  )),
  
  -- Admin fields
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Payment info
  payment_amount DECIMAL(10,2),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plot_reservations_user_id ON plot_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_plot_reservations_plot_id ON plot_reservations(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_reservations_status ON plot_reservations(status);
CREATE INDEX IF NOT EXISTS idx_plot_reservations_created_at ON plot_reservations(created_at DESC);

-- Enable RLS
ALTER TABLE plot_reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON plot_reservations;
DROP POLICY IF EXISTS "Admins can update reservations" ON plot_reservations;

-- RLS Policies
-- Users can view their own reservations
CREATE POLICY "Users can view their own reservations"
ON plot_reservations FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Users can create their own reservations
CREATE POLICY "Users can create reservations"
ON plot_reservations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations"
ON plot_reservations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Admins can update reservations
CREATE POLICY "Admins can update reservations"
ON plot_reservations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'plot_reservations'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ plot_reservations table created successfully!';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ You can now submit plot reservations';
END $$;

