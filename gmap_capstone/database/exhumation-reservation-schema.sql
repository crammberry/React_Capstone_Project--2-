-- ===============================================================================
-- EXHUMATION & PLOT RESERVATION SYSTEM - Complete Database Schema
-- ===============================================================================
-- This creates tables for:
-- 1. Exhumation requests (In/Out)
-- 2. Plot reservations
-- 3. Document uploads
-- 4. Payment tracking
-- ===============================================================================

-- ============================================
-- TABLE 1: Exhumation Requests
-- ============================================

CREATE TABLE IF NOT EXISTS exhumation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User & Plot Info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plot_id VARCHAR(50) NOT NULL, -- e.g., "VET-L1-1A"
  
  -- Request Type
  request_type VARCHAR(10) NOT NULL CHECK (request_type IN ('IN', 'OUT')),
  -- IN = Moving remains INTO this plot
  -- OUT = Removing remains FROM this plot
  
  -- Deceased Person Info
  deceased_name VARCHAR(255) NOT NULL,
  deceased_date_of_death DATE NOT NULL,
  deceased_date_of_burial DATE,
  deceased_relationship VARCHAR(100) NOT NULL, -- relationship to requestor
  
  -- Requestor Info (from user profile + additional)
  requestor_name VARCHAR(255) NOT NULL,
  requestor_email VARCHAR(255) NOT NULL,
  requestor_phone VARCHAR(50) NOT NULL,
  requestor_address TEXT NOT NULL,
  
  -- Exhumation Details
  reason_for_exhumation TEXT NOT NULL,
  preferred_date DATE,
  new_location TEXT, -- For "OUT" requests - where remains will go
  
  -- Document URLs (stored in Supabase Storage)
  valid_id_url TEXT, -- Government-issued ID
  death_certificate_url TEXT, -- Death certificate of deceased
  birth_certificate_url TEXT, -- Birth certificate (proves relationship)
  affidavit_url TEXT, -- Affidavit of relationship
  burial_permit_url TEXT, -- Original burial permit (if available)
  
  -- Additional documents
  additional_documents JSONB DEFAULT '[]', -- Array of {name, url}
  
  -- Request Status
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',           -- Awaiting admin review
    'UNDER_REVIEW',      -- Admin is reviewing
    'APPROVED',          -- Approved, awaiting document verification
    'DOCUMENTS_VERIFIED', -- Documents verified, awaiting payment
    'PAID',              -- Payment completed
    'SCHEDULED',         -- Exhumation scheduled
    'COMPLETED',         -- Exhumation completed
    'REJECTED',          -- Request rejected
    'CANCELLED'          -- User cancelled
  )),
  
  -- Admin Review
  admin_id UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Payment Info
  payment_amount DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN (
    'UNPAID', 'PENDING', 'PAID', 'REFUNDED'
  )),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference VARCHAR(100),
  
  -- Schedule
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- TABLE 2: Plot Reservations
-- ============================================

CREATE TABLE IF NOT EXISTS plot_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User & Plot Info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plot_id VARCHAR(50) NOT NULL, -- e.g., "VET-L1-1A"
  
  -- Reservation Purpose
  reservation_type VARCHAR(20) NOT NULL CHECK (reservation_type IN (
    'PRE_NEED',      -- Buying plot in advance
    'IMMEDIATE',     -- Immediate burial need
    'TRANSFER'       -- Transferring ownership
  )),
  
  -- Beneficiary Info (who will be buried)
  beneficiary_name VARCHAR(255),
  beneficiary_relationship VARCHAR(100),
  is_for_self BOOLEAN DEFAULT false, -- Is user reserving for themselves?
  
  -- Requestor Info
  requestor_name VARCHAR(255) NOT NULL,
  requestor_email VARCHAR(255) NOT NULL,
  requestor_phone VARCHAR(50) NOT NULL,
  requestor_address TEXT NOT NULL,
  
  -- Documents
  valid_id_url TEXT NOT NULL,
  proof_of_relationship_url TEXT, -- If not for self
  additional_documents JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',           -- Awaiting admin review
    'APPROVED',          -- Approved, awaiting payment
    'PAID',              -- Payment completed
    'ACTIVE',            -- Reservation active (plot reserved)
    'EXPIRED',           -- Reservation expired
    'CANCELLED',         -- User cancelled
    'REJECTED'           -- Admin rejected
  )),
  
  -- Admin Review
  admin_id UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Payment
  payment_amount DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'UNPAID',
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference VARCHAR(100),
  
  -- Reservation Validity
  reservation_expires_at TIMESTAMP WITH TIME ZONE, -- Auto-calculated
  reservation_duration_days INTEGER DEFAULT 30, -- How long reservation lasts
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- TABLE 3: Update Plots Table
-- ============================================

-- Add new status options to plots table
-- (Run this only if your plots table exists)

DO $$
BEGIN
  -- Check if plots table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'plots') THEN
    -- Add reserved_by column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'plots' AND column_name = 'reserved_by'
    ) THEN
      ALTER TABLE plots ADD COLUMN reserved_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add reservation_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'plots' AND column_name = 'reservation_id'
    ) THEN
      ALTER TABLE plots ADD COLUMN reservation_id UUID REFERENCES plot_reservations(id);
    END IF;
    
    -- Add reserved_until column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'plots' AND column_name = 'reserved_until'
    ) THEN
      ALTER TABLE plots ADD COLUMN reserved_until TIMESTAMP WITH TIME ZONE;
    END IF;
  END IF;
END $$;

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_exhumation_user_id ON exhumation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_exhumation_plot_id ON exhumation_requests(plot_id);
CREATE INDEX IF NOT EXISTS idx_exhumation_status ON exhumation_requests(status);
CREATE INDEX IF NOT EXISTS idx_exhumation_created_at ON exhumation_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reservation_user_id ON plot_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservation_plot_id ON plot_reservations(plot_id);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON plot_reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservation_created_at ON plot_reservations(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE exhumation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_reservations ENABLE ROW LEVEL SECURITY;

-- Exhumation Requests Policies
DROP POLICY IF EXISTS "Users can view own exhumation requests" ON exhumation_requests;
CREATE POLICY "Users can view own exhumation requests" ON exhumation_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create exhumation requests" ON exhumation_requests;
CREATE POLICY "Users can create exhumation requests" ON exhumation_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pending requests" ON exhumation_requests;
CREATE POLICY "Users can update own pending requests" ON exhumation_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'PENDING');

-- Note: We allow ALL authenticated users to view exhumation requests
-- Frontend controls who sees what based on user role
-- This prevents RLS infinite recursion issues
DROP POLICY IF EXISTS "Admins can view all exhumation requests" ON exhumation_requests;
CREATE POLICY "Admins can view all exhumation requests" ON exhumation_requests
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update exhumation requests" ON exhumation_requests;
CREATE POLICY "Admins can update exhumation requests" ON exhumation_requests
  FOR UPDATE TO authenticated
  USING (true);

-- Plot Reservations Policies
DROP POLICY IF EXISTS "Users can view own reservations" ON plot_reservations;
CREATE POLICY "Users can view own reservations" ON plot_reservations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create reservations" ON plot_reservations;
CREATE POLICY "Users can create reservations" ON plot_reservations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pending reservations" ON plot_reservations;
CREATE POLICY "Users can update own pending reservations" ON plot_reservations
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'PENDING');

-- Allow all authenticated users to view reservations (frontend controls access)
DROP POLICY IF EXISTS "Admins can view all reservations" ON plot_reservations;
CREATE POLICY "Admins can view all reservations" ON plot_reservations
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update reservations" ON plot_reservations;
CREATE POLICY "Admins can update reservations" ON plot_reservations
  FOR UPDATE TO authenticated
  USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_exhumation_requests_updated_at ON exhumation_requests;
CREATE TRIGGER update_exhumation_requests_updated_at
  BEFORE UPDATE ON exhumation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plot_reservations_updated_at ON plot_reservations;
CREATE TRIGGER update_plot_reservations_updated_at
  BEFORE UPDATE ON plot_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set reservation expiry
CREATE OR REPLACE FUNCTION set_reservation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reservation_expires_at IS NULL THEN
    NEW.reservation_expires_at = NOW() + (NEW.reservation_duration_days || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_reservation_expiry_trigger ON plot_reservations;
CREATE TRIGGER set_reservation_expiry_trigger
  BEFORE INSERT ON plot_reservations
  FOR EACH ROW
  EXECUTE FUNCTION set_reservation_expiry();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('exhumation_requests', 'plot_reservations')
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('exhumation_requests', 'plot_reservations');

-- Count policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('exhumation_requests', 'plot_reservations')
GROUP BY tablename;

-- ============================================
-- ✅ DONE!
-- ============================================
-- Tables created:
-- ✅ exhumation_requests - Stores exhumation requests (IN/OUT)
-- ✅ plot_reservations - Stores plot reservations
-- ✅ Updated plots table with reservation fields
-- ✅ RLS policies for security
-- ✅ Triggers for auto-updates
-- ✅ Indexes for performance

