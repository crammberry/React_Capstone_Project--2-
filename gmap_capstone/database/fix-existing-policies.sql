-- FIX EXISTING POLICIES ERROR
-- Run this SQL script to handle existing policies

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Allow public read access to plots" ON public.plots;
DROP POLICY IF EXISTS "Allow authenticated users to insert plots" ON public.plots;
DROP POLICY IF EXISTS "Allow authenticated users to update plots" ON public.plots;
DROP POLICY IF EXISTS "Allow authenticated users to delete plots" ON public.plots;

-- Now create the policies
CREATE POLICY "Allow public read access to plots" ON public.plots
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert plots" ON public.plots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update plots" ON public.plots
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete plots" ON public.plots
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data if table is empty
INSERT INTO public.plots (plot_id, section, level, plot_number, status, occupant_name) 
SELECT * FROM (VALUES
  ('VET-L1-1A', 'VETERANS', 1, '1A', 'available', NULL),
  ('VET-L1-1B', 'VETERANS', 1, '1B', 'occupied', 'John Doe'),
  ('VET-L1-1C', 'VETERANS', 1, '1C', 'available', NULL),
  ('LB-L1-1A', 'LEFT-BLOCK', 1, '1A', 'available', NULL),
  ('LB-L1-1B', 'LEFT-BLOCK', 1, '1B', 'occupied', 'Jane Smith'),
  ('RB-L1-1A', 'RIGHT-BLOCK', 1, '1A', 'available', NULL),
  ('APT-V-1', 'APT-V', 1, '1', 'available', NULL),
  ('APT-V-2', 'APT-V', 1, '2', 'occupied', 'Robert Johnson'),
  ('APT-2ND-1', 'APT-2ND', 1, '1', 'available', NULL),
  ('APT-2ND-2', 'APT-2ND', 1, '2', 'reserved', NULL)
) AS t(plot_id, section, level, plot_number, status, occupant_name)
WHERE NOT EXISTS (SELECT 1 FROM public.plots WHERE plot_id = t.plot_id);




