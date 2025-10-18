-- Cemetery Management Database Schema (FIXED VERSION)
-- This schema matches the exact structure of the cemetery system

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

-- Insert sample data for all sections
INSERT INTO plots (plot_id, section, level, plot_number, status, occupant_name, date_of_interment, notes) VALUES
-- Left Side Pasilyo plots (Level 1-3, 8 plots each)
('left-side-pasilyo-level1-A1', 'left-side-pasilyo', 1, 'A1', 'available', '', NULL, ''),
('left-side-pasilyo-level1-A2', 'left-side-pasilyo', 1, 'A2', 'available', '', NULL, ''),
('left-side-pasilyo-level1-A3', 'left-side-pasilyo', 1, 'A3', 'available', '', NULL, ''),
('left-side-pasilyo-level1-A4', 'left-side-pasilyo', 1, 'A4', 'available', '', NULL, ''),
('left-side-pasilyo-level1-A5', 'left-side-pasilyo', 1, 'A5', 'available', '', NULL, ''),
('left-side-pasilyo-level1-A6', 'left-side-pasilyo', 1, 'A6', 'available', '', NULL, ''),
('left-side-pasilyo-level1-A7', 'left-side-pasilyo', 1, 'A7', 'available', '', NULL, ''),
('left-side-pasilyo-level1-A8', 'left-side-pasilyo', 1, 'A8', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A1', 'left-side-pasilyo', 2, 'A1', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A2', 'left-side-pasilyo', 2, 'A2', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A3', 'left-side-pasilyo', 2, 'A3', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A4', 'left-side-pasilyo', 2, 'A4', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A5', 'left-side-pasilyo', 2, 'A5', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A6', 'left-side-pasilyo', 2, 'A6', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A7', 'left-side-pasilyo', 2, 'A7', 'available', '', NULL, ''),
('left-side-pasilyo-level2-A8', 'left-side-pasilyo', 2, 'A8', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A1', 'left-side-pasilyo', 3, 'A1', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A2', 'left-side-pasilyo', 3, 'A2', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A3', 'left-side-pasilyo', 3, 'A3', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A4', 'left-side-pasilyo', 3, 'A4', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A5', 'left-side-pasilyo', 3, 'A5', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A6', 'left-side-pasilyo', 3, 'A6', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A7', 'left-side-pasilyo', 3, 'A7', 'available', '', NULL, ''),
('left-side-pasilyo-level3-A8', 'left-side-pasilyo', 3, 'A8', 'available', '', NULL, ''),

-- Right Side Pasilyo plots (Level 1-3, 8 plots each)
('right-side-pasilyo-level1-A1', 'right-side-pasilyo', 1, 'A1', 'available', '', NULL, ''),
('right-side-pasilyo-level1-A2', 'right-side-pasilyo', 1, 'A2', 'available', '', NULL, ''),
('right-side-pasilyo-level1-A3', 'right-side-pasilyo', 1, 'A3', 'available', '', NULL, ''),
('right-side-pasilyo-level1-A4', 'right-side-pasilyo', 1, 'A4', 'available', '', NULL, ''),
('right-side-pasilyo-level1-A5', 'right-side-pasilyo', 1, 'A5', 'available', '', NULL, ''),
('right-side-pasilyo-level1-A6', 'right-side-pasilyo', 1, 'A6', 'available', '', NULL, ''),
('right-side-pasilyo-level1-A7', 'right-side-pasilyo', 1, 'A7', 'available', '', NULL, ''),
('right-side-pasilyo-level1-A8', 'right-side-pasilyo', 1, 'A8', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A1', 'right-side-pasilyo', 2, 'A1', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A2', 'right-side-pasilyo', 2, 'A2', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A3', 'right-side-pasilyo', 2, 'A3', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A4', 'right-side-pasilyo', 2, 'A4', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A5', 'right-side-pasilyo', 2, 'A5', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A6', 'right-side-pasilyo', 2, 'A6', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A7', 'right-side-pasilyo', 2, 'A7', 'available', '', NULL, ''),
('right-side-pasilyo-level2-A8', 'right-side-pasilyo', 2, 'A8', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A1', 'right-side-pasilyo', 3, 'A1', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A2', 'right-side-pasilyo', 3, 'A2', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A3', 'right-side-pasilyo', 3, 'A3', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A4', 'right-side-pasilyo', 3, 'A4', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A5', 'right-side-pasilyo', 3, 'A5', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A6', 'right-side-pasilyo', 3, 'A6', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A7', 'right-side-pasilyo', 3, 'A7', 'available', '', NULL, ''),
('right-side-pasilyo-level3-A8', 'right-side-pasilyo', 3, 'A8', 'available', '', NULL, ''),

-- Left Block plots (Level 1-3, 8 plots each)
('left-block-level1-A1', 'left-block', 1, 'A1', 'available', '', NULL, ''),
('left-block-level1-A2', 'left-block', 1, 'A2', 'available', '', NULL, ''),
('left-block-level1-A3', 'left-block', 1, 'A3', 'available', '', NULL, ''),
('left-block-level1-A4', 'left-block', 1, 'A4', 'available', '', NULL, ''),
('left-block-level1-A5', 'left-block', 1, 'A5', 'available', '', NULL, ''),
('left-block-level1-A6', 'left-block', 1, 'A6', 'available', '', NULL, ''),
('left-block-level1-A7', 'left-block', 1, 'A7', 'available', '', NULL, ''),
('left-block-level1-A8', 'left-block', 1, 'A8', 'available', '', NULL, ''),
('left-block-level2-A1', 'left-block', 2, 'A1', 'available', '', NULL, ''),
('left-block-level2-A2', 'left-block', 2, 'A2', 'available', '', NULL, ''),
('left-block-level2-A3', 'left-block', 2, 'A3', 'available', '', NULL, ''),
('left-block-level2-A4', 'left-block', 2, 'A4', 'available', '', NULL, ''),
('left-block-level2-A5', 'left-block', 2, 'A5', 'available', '', NULL, ''),
('left-block-level2-A6', 'left-block', 2, 'A6', 'available', '', NULL, ''),
('left-block-level2-A7', 'left-block', 2, 'A7', 'available', '', NULL, ''),
('left-block-level2-A8', 'left-block', 2, 'A8', 'available', '', NULL, ''),
('left-block-level3-A1', 'left-block', 3, 'A1', 'available', '', NULL, ''),
('left-block-level3-A2', 'left-block', 3, 'A2', 'available', '', NULL, ''),
('left-block-level3-A3', 'left-block', 3, 'A3', 'available', '', NULL, ''),
('left-block-level3-A4', 'left-block', 3, 'A4', 'available', '', NULL, ''),
('left-block-level3-A5', 'left-block', 3, 'A5', 'available', '', NULL, ''),
('left-block-level3-A6', 'left-block', 3, 'A6', 'available', '', NULL, ''),
('left-block-level3-A7', 'left-block', 3, 'A7', 'available', '', NULL, ''),
('left-block-level3-A8', 'left-block', 3, 'A8', 'available', '', NULL, ''),

-- Right Block plots (Level 1-3, 8 plots each)
('right-block-level1-A1', 'right-block', 1, 'A1', 'available', '', NULL, ''),
('right-block-level1-A2', 'right-block', 1, 'A2', 'available', '', NULL, ''),
('right-block-level1-A3', 'right-block', 1, 'A3', 'available', '', NULL, ''),
('right-block-level1-A4', 'right-block', 1, 'A4', 'available', '', NULL, ''),
('right-block-level1-A5', 'right-block', 1, 'A5', 'available', '', NULL, ''),
('right-block-level1-A6', 'right-block', 1, 'A6', 'available', '', NULL, ''),
('right-block-level1-A7', 'right-block', 1, 'A7', 'available', '', NULL, ''),
('right-block-level1-A8', 'right-block', 1, 'A8', 'available', '', NULL, ''),
('right-block-level2-A1', 'right-block', 2, 'A1', 'available', '', NULL, ''),
('right-block-level2-A2', 'right-block', 2, 'A2', 'available', '', NULL, ''),
('right-block-level2-A3', 'right-block', 2, 'A3', 'available', '', NULL, ''),
('right-block-level2-A4', 'right-block', 2, 'A4', 'available', '', NULL, ''),
('right-block-level2-A5', 'right-block', 2, 'A5', 'available', '', NULL, ''),
('right-block-level2-A6', 'right-block', 2, 'A6', 'available', '', NULL, ''),
('right-block-level2-A7', 'right-block', 2, 'A7', 'available', '', NULL, ''),
('right-block-level2-A8', 'right-block', 2, 'A8', 'available', '', NULL, ''),
('right-block-level3-A1', 'right-block', 3, 'A1', 'available', '', NULL, ''),
('right-block-level3-A2', 'right-block', 3, 'A2', 'available', '', NULL, ''),
('right-block-level3-A3', 'right-block', 3, 'A3', 'available', '', NULL, ''),
('right-block-level3-A4', 'right-block', 3, 'A4', 'available', '', NULL, ''),
('right-block-level3-A5', 'right-block', 3, 'A5', 'available', '', NULL, ''),
('right-block-level3-A6', 'right-block', 3, 'A6', 'available', '', NULL, ''),
('right-block-level3-A7', 'right-block', 3, 'A7', 'available', '', NULL, ''),
('right-block-level3-A8', 'right-block', 3, 'A8', 'available', '', NULL, ''),

-- Apartment plots (Level 1-5, 25 plots each level) - ALL 5 LEVELS AS REQUESTED
-- Level 1
('apartment-level1-A1', 'apartment', 1, 'A1', 'available', '', NULL, ''),
('apartment-level1-A2', 'apartment', 1, 'A2', 'available', '', NULL, ''),
('apartment-level1-A3', 'apartment', 1, 'A3', 'available', '', NULL, ''),
('apartment-level1-A4', 'apartment', 1, 'A4', 'available', '', NULL, ''),
('apartment-level1-A5', 'apartment', 1, 'A5', 'available', '', NULL, ''),
('apartment-level1-A6', 'apartment', 1, 'A6', 'available', '', NULL, ''),
('apartment-level1-A7', 'apartment', 1, 'A7', 'available', '', NULL, ''),
('apartment-level1-A8', 'apartment', 1, 'A8', 'available', '', NULL, ''),
('apartment-level1-A9', 'apartment', 1, 'A9', 'available', '', NULL, ''),
('apartment-level1-A10', 'apartment', 1, 'A10', 'available', '', NULL, ''),
('apartment-level1-A11', 'apartment', 1, 'A11', 'available', '', NULL, ''),
('apartment-level1-A12', 'apartment', 1, 'A12', 'available', '', NULL, ''),
('apartment-level1-A13', 'apartment', 1, 'A13', 'available', '', NULL, ''),
('apartment-level1-A14', 'apartment', 1, 'A14', 'available', '', NULL, ''),
('apartment-level1-A15', 'apartment', 1, 'A15', 'available', '', NULL, ''),
('apartment-level1-A16', 'apartment', 1, 'A16', 'available', '', NULL, ''),
('apartment-level1-A17', 'apartment', 1, 'A17', 'available', '', NULL, ''),
('apartment-level1-A18', 'apartment', 1, 'A18', 'available', '', NULL, ''),
('apartment-level1-A19', 'apartment', 1, 'A19', 'available', '', NULL, ''),
('apartment-level1-A20', 'apartment', 1, 'A20', 'available', '', NULL, ''),
('apartment-level1-A21', 'apartment', 1, 'A21', 'available', '', NULL, ''),
('apartment-level1-A22', 'apartment', 1, 'A22', 'available', '', NULL, ''),
('apartment-level1-A23', 'apartment', 1, 'A23', 'available', '', NULL, ''),
('apartment-level1-A24', 'apartment', 1, 'A24', 'available', '', NULL, ''),
('apartment-level1-A25', 'apartment', 1, 'A25', 'available', '', NULL, ''),

-- Level 2
('apartment-level2-A1', 'apartment', 2, 'A1', 'available', '', NULL, ''),
('apartment-level2-A2', 'apartment', 2, 'A2', 'available', '', NULL, ''),
('apartment-level2-A3', 'apartment', 2, 'A3', 'available', '', NULL, ''),
('apartment-level2-A4', 'apartment', 2, 'A4', 'available', '', NULL, ''),
('apartment-level2-A5', 'apartment', 2, 'A5', 'available', '', NULL, ''),
('apartment-level2-A6', 'apartment', 2, 'A6', 'available', '', NULL, ''),
('apartment-level2-A7', 'apartment', 2, 'A7', 'available', '', NULL, ''),
('apartment-level2-A8', 'apartment', 2, 'A8', 'available', '', NULL, ''),
('apartment-level2-A9', 'apartment', 2, 'A9', 'available', '', NULL, ''),
('apartment-level2-A10', 'apartment', 2, 'A10', 'available', '', NULL, ''),
('apartment-level2-A11', 'apartment', 2, 'A11', 'available', '', NULL, ''),
('apartment-level2-A12', 'apartment', 2, 'A12', 'available', '', NULL, ''),
('apartment-level2-A13', 'apartment', 2, 'A13', 'available', '', NULL, ''),
('apartment-level2-A14', 'apartment', 2, 'A14', 'available', '', NULL, ''),
('apartment-level2-A15', 'apartment', 2, 'A15', 'available', '', NULL, ''),
('apartment-level2-A16', 'apartment', 2, 'A16', 'available', '', NULL, ''),
('apartment-level2-A17', 'apartment', 2, 'A17', 'available', '', NULL, ''),
('apartment-level2-A18', 'apartment', 2, 'A18', 'available', '', NULL, ''),
('apartment-level2-A19', 'apartment', 2, 'A19', 'available', '', NULL, ''),
('apartment-level2-A20', 'apartment', 2, 'A20', 'available', '', NULL, ''),
('apartment-level2-A21', 'apartment', 2, 'A21', 'available', '', NULL, ''),
('apartment-level2-A22', 'apartment', 2, 'A22', 'available', '', NULL, ''),
('apartment-level2-A23', 'apartment', 2, 'A23', 'available', '', NULL, ''),
('apartment-level2-A24', 'apartment', 2, 'A24', 'available', '', NULL, ''),
('apartment-level2-A25', 'apartment', 2, 'A25', 'available', '', NULL, ''),

-- Level 3
('apartment-level3-A1', 'apartment', 3, 'A1', 'available', '', NULL, ''),
('apartment-level3-A2', 'apartment', 3, 'A2', 'available', '', NULL, ''),
('apartment-level3-A3', 'apartment', 3, 'A3', 'available', '', NULL, ''),
('apartment-level3-A4', 'apartment', 3, 'A4', 'available', '', NULL, ''),
('apartment-level3-A5', 'apartment', 3, 'A5', 'available', '', NULL, ''),
('apartment-level3-A6', 'apartment', 3, 'A6', 'available', '', NULL, ''),
('apartment-level3-A7', 'apartment', 3, 'A7', 'available', '', NULL, ''),
('apartment-level3-A8', 'apartment', 3, 'A8', 'available', '', NULL, ''),
('apartment-level3-A9', 'apartment', 3, 'A9', 'available', '', NULL, ''),
('apartment-level3-A10', 'apartment', 3, 'A10', 'available', '', NULL, ''),
('apartment-level3-A11', 'apartment', 3, 'A11', 'available', '', NULL, ''),
('apartment-level3-A12', 'apartment', 3, 'A12', 'available', '', NULL, ''),
('apartment-level3-A13', 'apartment', 3, 'A13', 'available', '', NULL, ''),
('apartment-level3-A14', 'apartment', 3, 'A14', 'available', '', NULL, ''),
('apartment-level3-A15', 'apartment', 3, 'A15', 'available', '', NULL, ''),
('apartment-level3-A16', 'apartment', 3, 'A16', 'available', '', NULL, ''),
('apartment-level3-A17', 'apartment', 3, 'A17', 'available', '', NULL, ''),
('apartment-level3-A18', 'apartment', 3, 'A18', 'available', '', NULL, ''),
('apartment-level3-A19', 'apartment', 3, 'A19', 'available', '', NULL, ''),
('apartment-level3-A20', 'apartment', 3, 'A20', 'available', '', NULL, ''),
('apartment-level3-A21', 'apartment', 3, 'A21', 'available', '', NULL, ''),
('apartment-level3-A22', 'apartment', 3, 'A22', 'available', '', NULL, ''),
('apartment-level3-A23', 'apartment', 3, 'A23', 'available', '', NULL, ''),
('apartment-level3-A24', 'apartment', 3, 'A24', 'available', '', NULL, ''),
('apartment-level3-A25', 'apartment', 3, 'A25', 'available', '', NULL, ''),

-- Level 4
('apartment-level4-A1', 'apartment', 4, 'A1', 'available', '', NULL, ''),
('apartment-level4-A2', 'apartment', 4, 'A2', 'available', '', NULL, ''),
('apartment-level4-A3', 'apartment', 4, 'A3', 'available', '', NULL, ''),
('apartment-level4-A4', 'apartment', 4, 'A4', 'available', '', NULL, ''),
('apartment-level4-A5', 'apartment', 4, 'A5', 'available', '', NULL, ''),
('apartment-level4-A6', 'apartment', 4, 'A6', 'available', '', NULL, ''),
('apartment-level4-A7', 'apartment', 4, 'A7', 'available', '', NULL, ''),
('apartment-level4-A8', 'apartment', 4, 'A8', 'available', '', NULL, ''),
('apartment-level4-A9', 'apartment', 4, 'A9', 'available', '', NULL, ''),
('apartment-level4-A10', 'apartment', 4, 'A10', 'available', '', NULL, ''),
('apartment-level4-A11', 'apartment', 4, 'A11', 'available', '', NULL, ''),
('apartment-level4-A12', 'apartment', 4, 'A12', 'available', '', NULL, ''),
('apartment-level4-A13', 'apartment', 4, 'A13', 'available', '', NULL, ''),
('apartment-level4-A14', 'apartment', 4, 'A14', 'available', '', NULL, ''),
('apartment-level4-A15', 'apartment', 4, 'A15', 'available', '', NULL, ''),
('apartment-level4-A16', 'apartment', 4, 'A16', 'available', '', NULL, ''),
('apartment-level4-A17', 'apartment', 4, 'A17', 'available', '', NULL, ''),
('apartment-level4-A18', 'apartment', 4, 'A18', 'available', '', NULL, ''),
('apartment-level4-A19', 'apartment', 4, 'A19', 'available', '', NULL, ''),
('apartment-level4-A20', 'apartment', 4, 'A20', 'available', '', NULL, ''),
('apartment-level4-A21', 'apartment', 4, 'A21', 'available', '', NULL, ''),
('apartment-level4-A22', 'apartment', 4, 'A22', 'available', '', NULL, ''),
('apartment-level4-A23', 'apartment', 4, 'A23', 'available', '', NULL, ''),
('apartment-level4-A24', 'apartment', 4, 'A24', 'available', '', NULL, ''),
('apartment-level4-A25', 'apartment', 4, 'A25', 'available', '', NULL, ''),

-- Level 5
('apartment-level5-A1', 'apartment', 5, 'A1', 'available', '', NULL, ''),
('apartment-level5-A2', 'apartment', 5, 'A2', 'available', '', NULL, ''),
('apartment-level5-A3', 'apartment', 5, 'A3', 'available', '', NULL, ''),
('apartment-level5-A4', 'apartment', 5, 'A4', 'available', '', NULL, ''),
('apartment-level5-A5', 'apartment', 5, 'A5', 'available', '', NULL, ''),
('apartment-level5-A6', 'apartment', 5, 'A6', 'available', '', NULL, ''),
('apartment-level5-A7', 'apartment', 5, 'A7', 'available', '', NULL, ''),
('apartment-level5-A8', 'apartment', 5, 'A8', 'available', '', NULL, ''),
('apartment-level5-A9', 'apartment', 5, 'A9', 'available', '', NULL, ''),
('apartment-level5-A10', 'apartment', 5, 'A10', 'available', '', NULL, ''),
('apartment-level5-A11', 'apartment', 5, 'A11', 'available', '', NULL, ''),
('apartment-level5-A12', 'apartment', 5, 'A12', 'available', '', NULL, ''),
('apartment-level5-A13', 'apartment', 5, 'A13', 'available', '', NULL, ''),
('apartment-level5-A14', 'apartment', 5, 'A14', 'available', '', NULL, ''),
('apartment-level5-A15', 'apartment', 5, 'A15', 'available', '', NULL, ''),
('apartment-level5-A16', 'apartment', 5, 'A16', 'available', '', NULL, ''),
('apartment-level5-A17', 'apartment', 5, 'A17', 'available', '', NULL, ''),
('apartment-level5-A18', 'apartment', 5, 'A18', 'available', '', NULL, ''),
('apartment-level5-A19', 'apartment', 5, 'A19', 'available', '', NULL, ''),
('apartment-level5-A20', 'apartment', 5, 'A20', 'available', '', NULL, ''),
('apartment-level5-A21', 'apartment', 5, 'A21', 'available', '', NULL, ''),
('apartment-level5-A22', 'apartment', 5, 'A22', 'available', '', NULL, ''),
('apartment-level5-A23', 'apartment', 5, 'A23', 'available', '', NULL, ''),
('apartment-level5-A24', 'apartment', 5, 'A24', 'available', '', NULL, ''),
('apartment-level5-A25', 'apartment', 5, 'A25', 'available', '', NULL, ''),

-- Fetus and Crematorium plots (T1-T13, R1-R12)
('fetus-crematorium-level1-T1', 'fetus-crematorium', 1, 'T1', 'available', '', NULL, ''),
('fetus-crematorium-level1-T2', 'fetus-crematorium', 1, 'T2', 'available', '', NULL, ''),
('fetus-crematorium-level1-T3', 'fetus-crematorium', 1, 'T3', 'available', '', NULL, ''),
('fetus-crematorium-level1-T4', 'fetus-crematorium', 1, 'T4', 'available', '', NULL, ''),
('fetus-crematorium-level1-T5', 'fetus-crematorium', 1, 'T5', 'available', '', NULL, ''),
('fetus-crematorium-level1-T6', 'fetus-crematorium', 1, 'T6', 'available', '', NULL, ''),
('fetus-crematorium-level1-T7', 'fetus-crematorium', 1, 'T7', 'available', '', NULL, ''),
('fetus-crematorium-level1-T8', 'fetus-crematorium', 1, 'T8', 'available', '', NULL, ''),
('fetus-crematorium-level1-T9', 'fetus-crematorium', 1, 'T9', 'available', '', NULL, ''),
('fetus-crematorium-level1-T10', 'fetus-crematorium', 1, 'T10', 'available', '', NULL, ''),
('fetus-crematorium-level1-T11', 'fetus-crematorium', 1, 'T11', 'available', '', NULL, ''),
('fetus-crematorium-level1-T12', 'fetus-crematorium', 1, 'T12', 'available', '', NULL, ''),
('fetus-crematorium-level1-T13', 'fetus-crematorium', 1, 'T13', 'available', '', NULL, ''),
('fetus-crematorium-level1-R1', 'fetus-crematorium', 1, 'R1', 'available', '', NULL, ''),
('fetus-crematorium-level1-R2', 'fetus-crematorium', 1, 'R2', 'available', '', NULL, ''),
('fetus-crematorium-level1-R3', 'fetus-crematorium', 1, 'R3', 'available', '', NULL, ''),
('fetus-crematorium-level1-R4', 'fetus-crematorium', 1, 'R4', 'available', '', NULL, ''),
('fetus-crematorium-level1-R5', 'fetus-crematorium', 1, 'R5', 'available', '', NULL, ''),
('fetus-crematorium-level1-R6', 'fetus-crematorium', 1, 'R6', 'available', '', NULL, ''),
('fetus-crematorium-level1-R7', 'fetus-crematorium', 1, 'R7', 'available', '', NULL, ''),
('fetus-crematorium-level1-R8', 'fetus-crematorium', 1, 'R8', 'available', '', NULL, ''),
('fetus-crematorium-level1-R9', 'fetus-crematorium', 1, 'R9', 'available', '', NULL, ''),
('fetus-crematorium-level1-R10', 'fetus-crematorium', 1, 'R10', 'available', '', NULL, ''),
('fetus-crematorium-level1-R11', 'fetus-crematorium', 1, 'R11', 'available', '', NULL, ''),
('fetus-crematorium-level1-R12', 'fetus-crematorium', 1, 'R12', 'available', '', NULL, '')

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


