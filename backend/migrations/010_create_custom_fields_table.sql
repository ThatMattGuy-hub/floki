-- Drop and recreate custom_fields table with correct schema
DROP TABLE IF EXISTS custom_fields CASCADE;

CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  is_internal_only BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX idx_custom_fields_name ON custom_fields(name);

-- Create index on type for filtering
CREATE INDEX idx_custom_fields_type ON custom_fields(type);

-- Add constraint for valid field types
ALTER TABLE custom_fields ADD CONSTRAINT custom_fields_type_check 
  CHECK (type IN ('text', 'number', 'date', 'select', 'multi_select', 'checkbox', 'url', 'email'));
