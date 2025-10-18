-- Cemetery Management Database Schema (FINAL VERSION)
-- This schema includes ALL required columns for the edit functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing plots table if it exists (to fix schema issues)
DROP TABLE IF EXISTS plots CASCADE;

-- Create the plots table with ALL required columns
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
('lb-4a', 'left-block', 1, '4A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-4b', 'left-block', 1, '4B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-4c', 'left-block', 1, '4C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-4d', 'left-block', 1, '4D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-4e', 'left-block', 1, '4E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-4f', 'left-block', 1, '4F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-6a', 'left-block', 1, '6A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-6b', 'left-block', 1, '6B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-6c', 'left-block', 1, '6C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-6d', 'left-block', 1, '6D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-6e', 'left-block', 1, '6E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-8a', 'left-block', 1, '8A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-8b', 'left-block', 1, '8B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-8c', 'left-block', 1, '8C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-8d', 'left-block', 1, '8D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-8e', 'left-block', 1, '8E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-8f', 'left-block', 1, '8F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-10a', 'left-block', 1, '10A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-10b', 'left-block', 1, '10B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-10c', 'left-block', 1, '10C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-10d', 'left-block', 1, '10D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-10e', 'left-block', 1, '10E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-10f', 'left-block', 1, '10F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-12a', 'left-block', 1, '12A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-12b', 'left-block', 1, '12B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-12c', 'left-block', 1, '12C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-12d', 'left-block', 1, '12D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-12e', 'left-block', 1, '12E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-12f', 'left-block', 1, '12F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-14a', 'left-block', 1, '14A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-14b', 'left-block', 1, '14B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-14c', 'left-block', 1, '14C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-14d', 'left-block', 1, '14D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-14e', 'left-block', 1, '14E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-14f', 'left-block', 1, '14F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-16a', 'left-block', 1, '16A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-16b', 'left-block', 1, '16B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-16c', 'left-block', 1, '16C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-16d', 'left-block', 1, '16D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-16e', 'left-block', 1, '16E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb18-a', 'left-block', 1, '18A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-18b', 'left-block', 1, '18B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-18c', 'left-block', 1, '18C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-18d', 'left-block', 1, '18D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-18e', 'left-block', 1, '18E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-18f', 'left-block', 1, '18F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-20a', 'left-block', 1, '20A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-20b', 'left-block', 1, '20B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-20c', 'left-block', 1, '20C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-20d', 'left-block', 1, '20D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-20e', 'left-block', 1, '20E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-20f', 'left-block', 1, '20F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-22a', 'left-block', 1, '22A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-22b', 'left-block', 1, '22B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-22c', 'left-block', 1, '22C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-22d', 'left-block', 1, '22D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('lb-22e', 'left-block', 1, '22E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),

-- Right Block (RB) plots - based on your actual map IDs
('rb-1a', 'right-block', 1, '1A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-1b', 'right-block', 1, '1B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-1c', 'right-block', 1, '1C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-1d', 'right-block', 1, '1D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-1e', 'right-block', 1, '1E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-3a', 'right-block', 1, '3A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-3b', 'right-block', 1, '3B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-3c', 'right-block', 1, '3C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-3d', 'right-block', 1, '3D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-3e', 'right-block', 1, '3E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-5a', 'right-block', 1, '5A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-5b', 'right-block', 1, '5B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-5c', 'right-block', 1, '5C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-5d', 'right-block', 1, '5D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-5e', 'right-block', 1, '5E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-7a', 'right-block', 1, '7A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-7b', 'right-block', 1, '7B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-7c', 'right-block', 1, '7C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-7d', 'right-block', 1, '7D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-7e', 'right-block', 1, '7E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-7f', 'right-block', 1, '7F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-9a', 'right-block', 1, '9A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-9b', 'right-block', 1, '9B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-9c', 'right-block', 1, '9C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-9d', 'right-block', 1, '9D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-9e', 'right-block', 1, '9E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-9f', 'right-block', 1, '9F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-11a', 'right-block', 1, '11A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-11b', 'right-block', 1, '11B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-11c', 'right-block', 1, '11C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-11d', 'right-block', 1, '11D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-11e', 'right-block', 1, '11E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-11f', 'right-block', 1, '11F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-13a', 'right-block', 1, '13A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-13b', 'right-block', 1, '13B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-13c', 'right-block', 1, '13C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-13d', 'right-block', 1, '13D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-13e', 'right-block', 1, '13E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-13f', 'right-block', 1, '13F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-15a', 'right-block', 1, '15A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-15b', 'right-block', 1, '15B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-15c', 'right-block', 1, '15C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-15d', 'right-block', 1, '15D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-15e', 'right-block', 1, '15E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-15f', 'right-block', 1, '15F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-17a', 'right-block', 1, '17A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-17b', 'right-block', 1, '17B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-17c', 'right-block', 1, '17C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-17d', 'right-block', 1, '17D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-17e', 'right-block', 1, '17E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-17f', 'right-block', 1, '17F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-19a', 'right-block', 1, '19A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-19b', 'right-block', 1, '19B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-19c', 'right-block', 1, '19C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-19d', 'right-block', 1, '19D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-19e', 'right-block', 1, '19E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-21a', 'right-block', 1, '21A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-21b', 'right-block', 1, '21B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-21c', 'right-block', 1, '21C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-21e', 'right-block', 1, '21E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-23a', 'right-block', 1, '23A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-23b', 'right-block', 1, '23B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-23c', 'right-block', 1, '23C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-23d', 'right-block', 1, '23D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-23e', 'right-block', 1, '23E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('rb-23f', 'right-block', 1, '23F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),

-- Apartment plots - 5 levels with 25 plots each
('apartment-level1-A1', 'apartment', 1, 'A1', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-A2', 'apartment', 1, 'A2', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-A3', 'apartment', 1, 'A3', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-A4', 'apartment', 1, 'A4', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-A5', 'apartment', 1, 'A5', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-B1', 'apartment', 1, 'B1', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-B2', 'apartment', 1, 'B2', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-B3', 'apartment', 1, 'B3', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-B4', 'apartment', 1, 'B4', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-B5', 'apartment', 1, 'B5', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-C1', 'apartment', 1, 'C1', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-C2', 'apartment', 1, 'C2', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-C3', 'apartment', 1, 'C3', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-C4', 'apartment', 1, 'C4', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-C5', 'apartment', 1, 'C5', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-D1', 'apartment', 1, 'D1', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-D2', 'apartment', 1, 'D2', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-D3', 'apartment', 1, 'D3', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-D4', 'apartment', 1, 'D4', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-D5', 'apartment', 1, 'D5', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-E1', 'apartment', 1, 'E1', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-E2', 'apartment', 1, 'E2', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-E3', 'apartment', 1, 'E3', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-E4', 'apartment', 1, 'E4', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-level1-E5', 'apartment', 1, 'E5', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),

-- Veterans section
('veterans', 'veterans', 1, 'VET', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),

-- Office section
('office', 'office', 1, 'OFF', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '');

-- Create function to get plots by section and level
CREATE OR REPLACE FUNCTION get_plots_by_section_and_level(section_name VARCHAR, level_num INTEGER)
RETURNS TABLE (
    plot_id VARCHAR,
    section VARCHAR,
    level INTEGER,
    plot_number VARCHAR,
    status VARCHAR,
    occupant_name VARCHAR,
    age INTEGER,
    cause_of_death VARCHAR,
    religion VARCHAR,
    family_name VARCHAR,
    next_of_kin VARCHAR,
    contact_number VARCHAR,
    date_of_interment DATE,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.plot_id,
        p.section,
        p.level,
        p.plot_number,
        p.status,
        p.occupant_name,
        p.age,
        p.cause_of_death,
        p.religion,
        p.family_name,
        p.next_of_kin,
        p.contact_number,
        p.date_of_interment,
        p.notes
    FROM plots p
    WHERE p.section = section_name 
    AND p.level = level_num
    ORDER BY p.plot_number;
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



