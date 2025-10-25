-- Cemetery Management Database Schema
-- This schema matches the exact structure of the cemetery system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create plots table with section-level-plot hierarchy
CREATE TABLE IF NOT EXISTS plots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plot_id VARCHAR(100) UNIQUE NOT NULL, -- e.g., "left-side-pasilyo-8-level1-A1"
  section VARCHAR(50) NOT NULL, -- e.g., "left-side-pasilyo"
  level INTEGER NOT NULL, -- e.g., 1, 2, 3
  plot_number VARCHAR(20) NOT NULL, -- e.g., "A1", "A2", "A3"
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'exhumed')),
  occupant_name VARCHAR(255) DEFAULT '',
  date_of_interment DATE DEFAULT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_plots_section ON plots(section);
CREATE INDEX IF NOT EXISTS idx_plots_level ON plots(level);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);
CREATE INDEX IF NOT EXISTS idx_plots_section_level ON plots(section, level);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_plots_updated_at 
    BEFORE UPDATE ON plots 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data matching your current structure
INSERT INTO plots (plot_id, section, level, plot_number, status, occupant_name, date_of_interment, notes) VALUES
-- Left Side Pasilyo plots
('left-side-pasilyo-8-level1-A1', 'left-side-pasilyo', 1, 'A1', 'available', '', NULL, ''),
('left-side-pasilyo-8-level1-A2', 'left-side-pasilyo', 1, 'A2', 'available', '', NULL, ''),
('left-side-pasilyo-8-level1-A3', 'left-side-pasilyo', 1, 'A3', 'available', '', NULL, ''),
('left-side-pasilyo-8-level1-A4', 'left-side-pasilyo', 1, 'A4', 'available', '', NULL, ''),
('left-side-pasilyo-8-level1-A5', 'left-side-pasilyo', 1, 'A5', 'available', '', NULL, ''),
('left-side-pasilyo-8-level1-A6', 'left-side-pasilyo', 1, 'A6', 'available', '', NULL, ''),
('left-side-pasilyo-8-level1-A7', 'left-side-pasilyo', 1, 'A7', 'available', '', NULL, ''),
('left-side-pasilyo-8-level1-A8', 'left-side-pasilyo', 1, 'A8', 'available', '', NULL, ''),

-- Right Side Pasilyo plots
('right-side-pasilyo-1-level1-A1', 'right-side-pasilyo', 1, 'A1', 'available', '', NULL, ''),
('right-side-pasilyo-1-level1-A2', 'right-side-pasilyo', 1, 'A2', 'available', '', NULL, ''),
('right-side-pasilyo-1-level1-A3', 'right-side-pasilyo', 1, 'A3', 'available', '', NULL, ''),
('right-side-pasilyo-1-level1-A4', 'right-side-pasilyo', 1, 'A4', 'available', '', NULL, ''),
('right-side-pasilyo-1-level1-A5', 'right-side-pasilyo', 1, 'A5', 'available', '', NULL, ''),
('right-side-pasilyo-1-level1-A6', 'right-side-pasilyo', 1, 'A6', 'available', '', NULL, ''),
('right-side-pasilyo-1-level1-A7', 'right-side-pasilyo', 1, 'A7', 'available', '', NULL, ''),
('right-side-pasilyo-1-level1-A8', 'right-side-pasilyo', 1, 'A8', 'available', '', NULL, ''),

-- Left Block plots
('left-block-2-level1-A1', 'left-block', 1, 'A1', 'available', '', NULL, ''),
('left-block-2-level1-A2', 'left-block', 1, 'A2', 'available', '', NULL, ''),
('left-block-2-level1-A3', 'left-block', 1, 'A3', 'available', '', NULL, ''),
('left-block-2-level1-A4', 'left-block', 1, 'A4', 'available', '', NULL, ''),
('left-block-2-level1-A5', 'left-block', 1, 'A5', 'available', '', NULL, ''),
('left-block-2-level1-A6', 'left-block', 1, 'A6', 'available', '', NULL, ''),
('left-block-2-level1-A7', 'left-block', 1, 'A7', 'available', '', NULL, ''),
('left-block-2-level1-A8', 'left-block', 1, 'A8', 'available', '', NULL, ''),

-- Right Block plots
('right-block-3-level1-A1', 'right-block', 1, 'A1', 'available', '', NULL, ''),
('right-block-3-level1-A2', 'right-block', 1, 'A2', 'available', '', NULL, ''),
('right-block-3-level1-A3', 'right-block', 1, 'A3', 'available', '', NULL, ''),
('right-block-3-level1-A4', 'right-block', 1, 'A4', 'available', '', NULL, ''),
('right-block-3-level1-A5', 'right-block', 1, 'A5', 'available', '', NULL, ''),
('right-block-3-level1-A6', 'right-block', 1, 'A6', 'available', '', NULL, ''),
('right-block-3-level1-A7', 'right-block', 1, 'A7', 'available', '', NULL, ''),
('right-block-3-level1-A8', 'right-block', 1, 'A8', 'available', '', NULL, ''),

-- Apartment plots (5 levels, 25 plots each)
('apartment-5-level1-A1', 'apartment', 1, 'A1', 'available', '', NULL, ''),
('apartment-5-level1-A2', 'apartment', 1, 'A2', 'available', '', NULL, ''),
('apartment-5-level1-A3', 'apartment', 1, 'A3', 'available', '', NULL, ''),
('apartment-5-level1-A4', 'apartment', 1, 'A4', 'available', '', NULL, ''),
('apartment-5-level1-A5', 'apartment', 1, 'A5', 'available', '', NULL, ''),
('apartment-5-level1-A6', 'apartment', 1, 'A6', 'available', '', NULL, ''),
('apartment-5-level1-A7', 'apartment', 1, 'A7', 'available', '', NULL, ''),
('apartment-5-level1-A8', 'apartment', 1, 'A8', 'available', '', NULL, ''),
('apartment-5-level1-A9', 'apartment', 1, 'A9', 'available', '', NULL, ''),
('apartment-5-level1-A10', 'apartment', 1, 'A10', 'available', '', NULL, ''),
('apartment-5-level1-A11', 'apartment', 1, 'A11', 'available', '', NULL, ''),
('apartment-5-level1-A12', 'apartment', 1, 'A12', 'available', '', NULL, ''),
('apartment-5-level1-A13', 'apartment', 1, 'A13', 'available', '', NULL, ''),
('apartment-5-level1-A14', 'apartment', 1, 'A14', 'available', '', NULL, ''),
('apartment-5-level1-A15', 'apartment', 1, 'A15', 'available', '', NULL, ''),
('apartment-5-level1-A16', 'apartment', 1, 'A16', 'available', '', NULL, ''),
('apartment-5-level1-A17', 'apartment', 1, 'A17', 'available', '', NULL, ''),
('apartment-5-level1-A18', 'apartment', 1, 'A18', 'available', '', NULL, ''),
('apartment-5-level1-A19', 'apartment', 1, 'A19', 'available', '', NULL, ''),
('apartment-5-level1-A20', 'apartment', 1, 'A20', 'available', '', NULL, ''),
('apartment-5-level1-A21', 'apartment', 1, 'A21', 'available', '', NULL, ''),
('apartment-5-level1-A22', 'apartment', 1, 'A22', 'available', '', NULL, ''),
('apartment-5-level1-A23', 'apartment', 1, 'A23', 'available', '', NULL, ''),
('apartment-5-level1-A24', 'apartment', 1, 'A24', 'available', '', NULL, ''),
('apartment-5-level1-A25', 'apartment', 1, 'A25', 'available', '', NULL, ''),

-- Fetus and Crematorium plots (T1-T13, R1-R12)
('fetus-crematorium-top-T1', 'fetus-crematorium', 1, 'T1', 'available', '', NULL, ''),
('fetus-crematorium-top-T2', 'fetus-crematorium', 1, 'T2', 'available', '', NULL, ''),
('fetus-crematorium-top-T3', 'fetus-crematorium', 1, 'T3', 'available', '', NULL, ''),
('fetus-crematorium-top-T4', 'fetus-crematorium', 1, 'T4', 'available', '', NULL, ''),
('fetus-crematorium-top-T5', 'fetus-crematorium', 1, 'T5', 'available', '', NULL, ''),
('fetus-crematorium-top-T6', 'fetus-crematorium', 1, 'T6', 'available', '', NULL, ''),
('fetus-crematorium-top-T7', 'fetus-crematorium', 1, 'T7', 'available', '', NULL, ''),
('fetus-crematorium-top-T8', 'fetus-crematorium', 1, 'T8', 'available', '', NULL, ''),
('fetus-crematorium-top-T9', 'fetus-crematorium', 1, 'T9', 'available', '', NULL, ''),
('fetus-crematorium-top-T10', 'fetus-crematorium', 1, 'T10', 'available', '', NULL, ''),
('fetus-crematorium-top-T11', 'fetus-crematorium', 1, 'T11', 'available', '', NULL, ''),
('fetus-crematorium-top-T12', 'fetus-crematorium', 1, 'T12', 'available', '', NULL, ''),
('fetus-crematorium-top-T13', 'fetus-crematorium', 1, 'T13', 'available', '', NULL, ''),
('fetus-crematorium-right-R1', 'fetus-crematorium', 1, 'R1', 'available', '', NULL, ''),
('fetus-crematorium-right-R2', 'fetus-crematorium', 1, 'R2', 'available', '', NULL, ''),
('fetus-crematorium-right-R3', 'fetus-crematorium', 1, 'R3', 'available', '', NULL, ''),
('fetus-crematorium-right-R4', 'fetus-crematorium', 1, 'R4', 'available', '', NULL, ''),
('fetus-crematorium-right-R5', 'fetus-crematorium', 1, 'R5', 'available', '', NULL, ''),
('fetus-crematorium-right-R6', 'fetus-crematorium', 1, 'R6', 'available', '', NULL, ''),
('fetus-crematorium-left-R7', 'fetus-crematorium', 1, 'R7', 'available', '', NULL, ''),
('fetus-crematorium-left-R8', 'fetus-crematorium', 1, 'R8', 'available', '', NULL, ''),
('fetus-crematorium-left-R9', 'fetus-crematorium', 1, 'R9', 'available', '', NULL, ''),
('fetus-crematorium-left-R10', 'fetus-crematorium', 1, 'R10', 'available', '', NULL, ''),
('fetus-crematorium-left-R11', 'fetus-crematorium', 1, 'R11', 'available', '', NULL, ''),
('fetus-crematorium-left-R12', 'fetus-crematorium', 1, 'R12', 'available', '', NULL, '')

ON CONFLICT (plot_id) DO NOTHING;

-- Create function to get plots by section and level
CREATE OR REPLACE FUNCTION get_plots_by_section_and_level(
  section_name VARCHAR(50),
  level_num INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  plot_id VARCHAR(100),
  section VARCHAR(50),
  level INTEGER,
  plot_number VARCHAR(20),
  status VARCHAR(20),
  occupant_name VARCHAR(255),
  date_of_interment DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF level_num IS NULL THEN
    RETURN QUERY
    SELECT p.id, p.plot_id, p.section, p.level, p.plot_number, p.status, 
           p.occupant_name, p.date_of_interment, p.notes, p.created_at, p.updated_at
    FROM plots p
    WHERE p.section = section_name
    ORDER BY p.level, p.plot_number;
  ELSE
    RETURN QUERY
    SELECT p.id, p.plot_id, p.section, p.level, p.plot_number, p.status, 
           p.occupant_name, p.date_of_interment, p.notes, p.created_at, p.updated_at
    FROM plots p
    WHERE p.section = section_name AND p.level = level_num
    ORDER BY p.plot_number;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get plot statistics
CREATE OR REPLACE FUNCTION get_plot_statistics()
RETURNS TABLE (
  total_plots BIGINT,
  available_plots BIGINT,
  occupied_plots BIGINT,
  reserved_plots BIGINT,
  exhumed_plots BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_plots,
    COUNT(*) FILTER (WHERE status = 'available') as available_plots,
    COUNT(*) FILTER (WHERE status = 'occupied') as occupied_plots,
    COUNT(*) FILTER (WHERE status = 'reserved') as reserved_plots,
    COUNT(*) FILTER (WHERE status = 'exhumed') as exhumed_plots
  FROM plots;
END;
$$ LANGUAGE plpgsql;

-- Create function to get plots by status
CREATE OR REPLACE FUNCTION get_plots_by_status(plot_status VARCHAR(20))
RETURNS TABLE (
  id UUID,
  plot_id VARCHAR(100),
  section VARCHAR(50),
  level INTEGER,
  plot_number VARCHAR(20),
  status VARCHAR(20),
  occupant_name VARCHAR(255),
  date_of_interment DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.plot_id, p.section, p.level, p.plot_number, p.status, 
         p.occupant_name, p.date_of_interment, p.notes, p.created_at, p.updated_at
  FROM plots p
  WHERE p.status = plot_status
  ORDER BY p.section, p.level, p.plot_number;
END;
$$ LANGUAGE plpgsql;


