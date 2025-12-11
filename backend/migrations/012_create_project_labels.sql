-- Create project_labels junction table
CREATE TABLE IF NOT EXISTS project_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, label_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_labels_project ON project_labels(project_id);
CREATE INDEX IF NOT EXISTS idx_project_labels_label ON project_labels(label_id);
