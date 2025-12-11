-- Add status column to projects table
-- Valid statuses: 'ongoing', 'on_hold', 'blocked', 'done', 'cancelled'
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ongoing';

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Update any existing projects to have 'ongoing' status
UPDATE projects SET status = 'ongoing' WHERE status IS NULL;

-- Add a check constraint to ensure valid status values
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('ongoing', 'on_hold', 'blocked', 'done', 'cancelled'));
