-- Add date fields to projects for roadmap visualization
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_end_date DATE;

-- Add progress tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Add roadmap-specific fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS roadmap_color VARCHAR(20) DEFAULT '#3B82F6'; -- Default blue
ALTER TABLE projects ADD COLUMN IF NOT EXISTS roadmap_visible BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS milestone_type VARCHAR(50); -- 'release', 'milestone', 'phase', etc.

-- Create indexes for date-based queries
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_target_end_date ON projects(target_end_date);
CREATE INDEX IF NOT EXISTS idx_projects_roadmap_visible ON projects(roadmap_visible);

-- Add comments
COMMENT ON COLUMN projects.start_date IS 'Project start date for roadmap visualization';
COMMENT ON COLUMN projects.target_end_date IS 'Target/planned end date';
COMMENT ON COLUMN projects.actual_end_date IS 'Actual completion date';
COMMENT ON COLUMN projects.progress_percentage IS 'Overall project progress (0-100)';
COMMENT ON COLUMN projects.roadmap_color IS 'Color used in roadmap visualization';
COMMENT ON COLUMN projects.roadmap_visible IS 'Whether to show this project on the roadmap';
COMMENT ON COLUMN projects.milestone_type IS 'Type of milestone for categorization';
