-- Cemetery Management Database Schema (CORRECTED VERSION)
-- This schema matches the ACTUAL structure of your cemetery map

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing plots table if it exists (to fix schema issues)
DROP TABLE IF EXISTS plots CASCADE;

-- Create the plots table with correct structure
CREATE TABLE plots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plot_id VARCHAR(100) UNIQUE NOT NULL,
    section VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL,
    plot_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'exhumed')),
    occupant_name VARCHAR(255) DEFAULT '',
    age INTEGER DEFAULT NULL,
    cause_of_death VARCHAR(255) DEFAULT NULL,
    religion VARCHAR(100) DEFAULT NULL,
    family_name VARCHAR(255) DEFAULT NULL,
    next_of_kin VARCHAR(255) DEFAULT NULL,
    contact_number VARCHAR(20) DEFAULT NULL,
    date_of_interment DATE DEFAULT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_plots_section ON plots(section);
CREATE INDEX idx_plots_level ON plots(level);
CREATE INDEX idx_plots_status ON plots(status);
CREATE INDEX idx_plots_section_level ON plots(section, level);

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

-- Insert sample data for ACTUAL sections from your map
INSERT INTO plots (plot_id, section, level, plot_number, status, occupant_name, age, cause_of_death, religion, family_name, next_of_kin, contact_number, date_of_interment, notes) VALUES
-- Left Block (LB) plots - based on your actual map IDs
('lb-2a', 'left-block', 1, '2A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-2b', 'left-block', 1, '2B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-2c', 'left-block', 1, '2C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-2d', 'left-block', 1, '2D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-2e', 'left-block', 1, '2E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-4a', 'left-block', 1, '4A', 'available', '', NULL, ''),
('lb-4b', 'left-block', 1, '4B', 'available', '', NULL, ''),
('lb-4c', 'left-block', 1, '4C', 'available', '', NULL, ''),
('lb-4d', 'left-block', 1, '4D', 'available', '', NULL, ''),
('lb-4e', 'left-block', 1, '4E', 'available', '', NULL, ''),
('lb-4f', 'left-block', 1, '4F', 'available', '', NULL, ''),
('lb-6a', 'left-block', 1, '6A', 'available', '', NULL, ''),
('lb-6b', 'left-block', 1, '6B', 'available', '', NULL, ''),
('lb-6c', 'left-block', 1, '6C', 'available', '', NULL, ''),
('lb-6d', 'left-block', 1, '6D', 'available', '', NULL, ''),
('lb-6e', 'left-block', 1, '6E', 'available', '', NULL, ''),
('lb-8a', 'left-block', 1, '8A', 'available', '', NULL, ''),
('lb-8b', 'left-block', 1, '8B', 'available', '', NULL, ''),
('lb-8c', 'left-block', 1, '8C', 'available', '', NULL, ''),

-- Right Block (RB) plots - based on your actual map IDs
('rb-1a', 'right-block', 1, '1A', 'available', '', NULL, ''),
('rb-1b', 'right-block', 1, '1B', 'available', '', NULL, ''),
('rb-1c', 'right-block', 1, '1C', 'available', '', NULL, ''),
('rb-1d', 'right-block', 1, '1D', 'available', '', NULL, ''),
('rb-1e', 'right-block', 1, '1E', 'available', '', NULL, ''),
('rb-3a', 'right-block', 1, '3A', 'available', '', NULL, ''),
('rb-3b', 'right-block', 1, '3B', 'available', '', NULL, ''),
('rb-3c', 'right-block', 1, '3C', 'available', '', NULL, ''),
('rb-3d', 'right-block', 1, '3D', 'available', '', NULL, ''),
('rb-3e', 'right-block', 1, '3E', 'available', '', NULL, ''),
('rb-3f', 'right-block', 1, '3F', 'available', '', NULL, ''),
('rb-5a', 'right-block', 1, '5A', 'available', '', NULL, ''),
('rb-5b', 'right-block', 1, '5B', 'available', '', NULL, ''),
('rb-5c', 'right-block', 1, '5C', 'available', '', NULL, ''),
('rb-5d', 'right-block', 1, '5D', 'available', '', NULL, ''),
('rb-5e', 'right-block', 1, '5E', 'available', '', NULL, ''),
('rb-7a', 'right-block', 1, '7A', 'available', '', NULL, ''),
('rb-7b', 'right-block', 1, '7B', 'available', '', NULL, ''),
('rb-7c', 'right-block', 1, '7C', 'available', '', NULL, ''),
('rb-7d', 'right-block', 1, '7D', 'available', '', NULL, ''),
('rb-7e', 'right-block', 1, '7E', 'available', '', NULL, ''),
('rb-7f', 'right-block', 1, '7F', 'available', '', NULL, ''),
('rb-9a', 'right-block', 1, '9A', 'available', '', NULL, ''),
('rb-9b', 'right-block', 1, '9B', 'available', '', NULL, ''),
('rb-9c', 'right-block', 1, '9C', 'available', '', NULL, ''),
('rb-9d', 'right-block', 1, '9D', 'available', '', NULL, ''),
('rb-9e', 'right-block', 1, '9E', 'available', '', NULL, ''),
('rb-9f', 'right-block', 1, '9F', 'available', '', NULL, ''),
('rb-11a', 'right-block', 1, '11A', 'available', '', NULL, ''),
('rb-11b', 'right-block', 1, '11B', 'available', '', NULL, ''),
('rb-11c', 'right-block', 1, '11C', 'available', '', NULL, ''),
('rb-11d', 'right-block', 1, '11D', 'available', '', NULL, ''),
('rb-11e', 'right-block', 1, '11E', 'available', '', NULL, ''),
('rb-11f', 'right-block', 1, '11F', 'available', '', NULL, ''),
('rb-13a', 'right-block', 1, '13A', 'available', '', NULL, ''),
('rb-13b', 'right-block', 1, '13B', 'available', '', NULL, ''),
('rb-13c', 'right-block', 1, '13C', 'available', '', NULL, ''),
('rb-13d', 'right-block', 1, '13D', 'available', '', NULL, ''),
('rb-13e', 'right-block', 1, '13E', 'available', '', NULL, ''),
('rb-13f', 'right-block', 1, '13F', 'available', '', NULL, ''),
('rb-15a', 'right-block', 1, '15A', 'available', '', NULL, ''),
('rb-15b', 'right-block', 1, '15B', 'available', '', NULL, ''),
('rb-15c', 'right-block', 1, '15C', 'available', '', NULL, ''),
('rb-15d', 'right-block', 1, '15D', 'available', '', NULL, ''),
('rb-15e', 'right-block', 1, '15E', 'available', '', NULL, ''),
('rb-15f', 'right-block', 1, '15F', 'available', '', NULL, ''),
('rb-17a', 'right-block', 1, '17A', 'available', '', NULL, ''),
('rb-17b', 'right-block', 1, '17B', 'available', '', NULL, ''),
('rb-17c', 'right-block', 1, '17C', 'available', '', NULL, ''),
('rb-17d', 'right-block', 1, '17D', 'available', '', NULL, ''),
('rb-17e', 'right-block', 1, '17E', 'available', '', NULL, ''),
('rb-17f', 'right-block', 1, '17F', 'available', '', NULL, ''),
('rb-19a', 'right-block', 1, '19A', 'available', '', NULL, ''),
('rb-19b', 'right-block', 1, '19B', 'available', '', NULL, ''),
('rb-19c', 'right-block', 1, '19C', 'available', '', NULL, ''),
('rb-19d', 'right-block', 1, '19D', 'available', '', NULL, ''),
('rb-19e', 'right-block', 1, '19E', 'available', '', NULL, ''),
('rb-19f', 'right-block', 1, '19F', 'available', '', NULL, ''),
('rb-21a', 'right-block', 1, '21A', 'available', '', NULL, ''),
('rb-21b', 'right-block', 1, '21B', 'available', '', NULL, ''),
('rb-21c', 'right-block', 1, '21C', 'available', '', NULL, ''),
('rb-21d', 'right-block', 1, '21D', 'available', '', NULL, ''),
('rb-21e', 'right-block', 1, '21E', 'available', '', NULL, ''),
('rb-21f', 'right-block', 1, '21F', 'available', '', NULL, ''),
('rb-23a', 'right-block', 1, '23A', 'available', '', NULL, ''),
('rb-23b', 'right-block', 1, '23B', 'available', '', NULL, ''),
('rb-23c', 'right-block', 1, '23C', 'available', '', NULL, ''),
('rb-23d', 'right-block', 1, '23D', 'available', '', NULL, ''),
('rb-23e', 'right-block', 1, '23E', 'available', '', NULL, ''),
('rb-23f', 'right-block', 1, '23F', 'available', '', NULL, ''),

-- Apartment plots - based on your actual map IDs
('apartment-4', 'apartment', 1, '4', 'available', '', NULL, ''),
('apartment-5', 'apartment', 1, '5', 'available', '', NULL, ''),
('apartment-2nd-level', 'apartment', 2, '2nd-level', 'available', '', NULL, ''),

-- Veterans section
('veterans', 'veterans', 1, 'V1', 'available', '', NULL, ''),

-- Office section (non-clickable but included for completeness)
('office', 'office', 1, 'O1', 'available', '', NULL, '')

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