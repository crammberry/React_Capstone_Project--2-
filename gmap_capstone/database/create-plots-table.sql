-- Create the plots table that DataService.js is trying to access
CREATE TABLE IF NOT EXISTS public.plots (
  id SERIAL PRIMARY KEY,
  plot_id VARCHAR(50) UNIQUE NOT NULL,
  section VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL,
  plot_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'exhumed')),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plots_section ON public.plots(section);
CREATE INDEX IF NOT EXISTS idx_plots_level ON public.plots(level);
CREATE INDEX IF NOT EXISTS idx_plots_status ON public.plots(status);
CREATE INDEX IF NOT EXISTS idx_plots_plot_id ON public.plots(plot_id);

-- Enable RLS
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to plots" ON public.plots
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert plots" ON public.plots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update plots" ON public.plots
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete plots" ON public.plots
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data to test
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

-- Create the exhumation_requests table that DataService.js also references
CREATE TABLE IF NOT EXISTS public.exhumation_requests (
  id SERIAL PRIMARY KEY,
  requestor_name VARCHAR(255) NOT NULL,
  requestor_contact VARCHAR(20) NOT NULL,
  requestor_relationship VARCHAR(100) NOT NULL,
  deceased_name VARCHAR(255) NOT NULL,
  plot_id VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  exhumation_date DATE,
  exhumation_team VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for exhumation_requests
ALTER TABLE public.exhumation_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for exhumation_requests
CREATE POLICY "Allow public read access to exhumation_requests" ON public.exhumation_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert exhumation_requests" ON public.exhumation_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update exhumation_requests" ON public.exhumation_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete exhumation_requests" ON public.exhumation_requests
  FOR DELETE USING (auth.role() = 'authenticated');




