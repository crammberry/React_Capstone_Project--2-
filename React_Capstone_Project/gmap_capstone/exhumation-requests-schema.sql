-- Exhumation Requests Table
CREATE TABLE IF NOT EXISTS exhumation_requests (
  id SERIAL PRIMARY KEY,
  plot_id VARCHAR(50) NOT NULL,
  deceased_name VARCHAR(255) NOT NULL,
  next_of_kin VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  alternative_location TEXT,
  special_instructions TEXT,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  exhumation_date DATE,
  exhumation_team VARCHAR(100),
  documents TEXT[], -- Array of document filenames
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exhumation_requests_plot_id ON exhumation_requests(plot_id);
CREATE INDEX IF NOT EXISTS idx_exhumation_requests_status ON exhumation_requests(status);
CREATE INDEX IF NOT EXISTS idx_exhumation_requests_request_date ON exhumation_requests(request_date);

-- Add foreign key constraint to plots table (if plots table exists)
-- ALTER TABLE exhumation_requests ADD CONSTRAINT fk_exhumation_requests_plot_id 
-- FOREIGN KEY (plot_id) REFERENCES plots(plot_id) ON DELETE CASCADE;

-- Insert some sample data for testing
INSERT INTO exhumation_requests (
  plot_id, deceased_name, next_of_kin, contact_number, relationship, 
  reason, alternative_location, special_instructions, status, admin_notes, 
  exhumation_date, exhumation_team, documents
) VALUES 
(
  'lb-10a', 'Juan Dela Cruz', 'Maria Dela Cruz', '09123456789', 'spouse',
  'family_relocation', 'New Cemetery, Manila', 'Handle with care, family will be present',
  'pending', '', NULL, '', ARRAY['death_certificate.pdf', 'family_consent.pdf']
),
(
  'rb-15b', 'Pedro Santos', 'Ana Santos', '09876543210', 'child',
  'cemetery_expansion', 'Apartment 3, Level 2', 'Relocate to new apartment section',
  'approved', 'Approved for relocation to new section', '2024-02-15', 'Team Alpha',
  ARRAY['death_certificate.pdf', 'family_consent.pdf', 'legal_document.pdf']
),
(
  'apartment-1-2c', 'Rosa Garcia', 'Carlos Garcia', '09111222333', 'sibling',
  'legal_requirement', 'Family mausoleum', 'Court order for exhumation',
  'completed', 'Exhumation completed successfully', '2024-02-20', 'Team Beta',
  ARRAY['court_order.pdf', 'death_certificate.pdf']
);



