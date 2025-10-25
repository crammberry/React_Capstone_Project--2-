-- SIMPLE PLOTS TABLE SETUP
-- This will create the plots table without policy conflicts

-- First, check if table exists and drop it if it does
DROP TABLE IF EXISTS public.plots CASCADE;

-- Create the plots table
CREATE TABLE public.plots (
  id SERIAL PRIMARY KEY,
  plot_id VARCHAR(50) UNIQUE NOT NULL,
  section VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL,
  plot_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  occupant_name VARCHAR(255),
  age INTEGER,
  cause_of_death TEXT,
  religion VARCHAR(100),
  family_name VARCHAR(255),
  next_of_kin VARCHAR(255),
  contact_number VARCHAR(20),
  date_of_interment DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Create simple policies
CREATE POLICY "Enable read access for all users" ON public.plots FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.plots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.plots FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.plots FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.plots (plot_id, section, level, plot_number, status, occupant_name) VALUES
('VET-L1-1A', 'VETERANS', 1, '1A', 'available', NULL),
('VET-L1-1B', 'VETERANS', 1, '1B', 'occupied', 'John Doe'),
('VET-L1-1C', 'VETERANS', 1, '1C', 'available', NULL),
('LB-L1-1A', 'LEFT-BLOCK', 1, '1A', 'available', NULL),
('LB-L1-1B', 'LEFT-BLOCK', 1, '1B', 'occupied', 'Jane Smith'),
('RB-L1-1A', 'RIGHT-BLOCK', 1, '1A', 'available', NULL),
('APT-V-1', 'APT-V', 1, '1', 'available', NULL),
('APT-V-2', 'APT-V', 1, '2', 'occupied', 'Robert Johnson'),
('APT-2ND-1', 'APT-2ND', 1, '1', 'available', NULL),
('APT-2ND-2', 'APT-2ND', 1, '2', 'reserved', NULL);




