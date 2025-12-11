-- Migration: Create reports2 table for Reports 2.0 (Looker Studio-style reporting)
-- This table stores report configurations with widget-based layouts

CREATE TABLE IF NOT EXISTS reports2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  widgets JSONB DEFAULT '[]'::jsonb,
  default_date_range JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_reports2_created_by ON reports2(created_by);
CREATE INDEX idx_reports2_is_shared ON reports2(is_shared);
CREATE INDEX idx_reports2_created_at ON reports2(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE reports2 ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports or shared reports
CREATE POLICY "Users can view own or shared reports2"
  ON reports2
  FOR SELECT
  USING (
    auth.uid() = created_by OR is_shared = true
  );

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports2"
  ON reports2
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own reports
CREATE POLICY "Users can update own reports2"
  ON reports2
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own reports
CREATE POLICY "Users can delete own reports2"
  ON reports2
  FOR DELETE
  USING (auth.uid() = created_by);

-- Add comment for documentation
COMMENT ON TABLE reports2 IS 'Reports 2.0 - Looker Studio-style interactive reports with drag-and-drop dimensions and metrics';
COMMENT ON COLUMN reports2.widgets IS 'Array of widget configurations (JSON) containing dimensions, metrics, filters, and visualization settings';
COMMENT ON COLUMN reports2.default_date_range IS 'Default date range configuration for the report (JSON)';
