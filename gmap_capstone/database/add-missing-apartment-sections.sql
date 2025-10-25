-- Add missing apartment sections to the database
-- This script adds apartment-2nd-level and other missing apartment sections

-- Apartment 2nd Level - All levels (1a, 1b, 1c, 1d, 1e, 1f, 1g, 1h for each level)
INSERT INTO plots (plot_id, section, level, plot_number, status, occupant_name, age, cause_of_death, religion, family_name, next_of_kin, contact_number, date_of_interment, notes) VALUES
('apartment-2nd-level-1a', 'apartment-2nd-level', 1, '1A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-1b', 'apartment-2nd-level', 1, '1B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-1c', 'apartment-2nd-level', 1, '1C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-1d', 'apartment-2nd-level', 1, '1D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-1e', 'apartment-2nd-level', 1, '1E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-1f', 'apartment-2nd-level', 1, '1F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-1g', 'apartment-2nd-level', 1, '1G', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-1h', 'apartment-2nd-level', 1, '1H', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2a', 'apartment-2nd-level', 2, '2A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2b', 'apartment-2nd-level', 2, '2B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2c', 'apartment-2nd-level', 2, '2C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2d', 'apartment-2nd-level', 2, '2D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2e', 'apartment-2nd-level', 2, '2E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2f', 'apartment-2nd-level', 2, '2F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2g', 'apartment-2nd-level', 2, '2G', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-2h', 'apartment-2nd-level', 2, '2H', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3a', 'apartment-2nd-level', 3, '3A', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3b', 'apartment-2nd-level', 3, '3B', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3c', 'apartment-2nd-level', 3, '3C', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3d', 'apartment-2nd-level', 3, '3D', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3e', 'apartment-2nd-level', 3, '3E', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3f', 'apartment-2nd-level', 3, '3F', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3g', 'apartment-2nd-level', 3, '3G', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
('apartment-2nd-level-3h', 'apartment-2nd-level', 3, '3H', 'available', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '');

-- Add other missing apartment sections if needed
-- You can add apartment-2, apartment-3, etc. following the same pattern



