-- Add priority_order column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0;

-- Add priority_order column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_priority_order ON projects(priority_order);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_order ON tasks(priority_order);
CREATE INDEX IF NOT EXISTS idx_tasks_project_priority ON tasks(project_id, priority_order);

-- Initialize priority_order based on created_at (older items get lower numbers)
WITH ranked_projects AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM projects
)
UPDATE projects
SET priority_order = ranked_projects.rn
FROM ranked_projects
WHERE projects.id = ranked_projects.id;

WITH ranked_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at ASC) as rn
  FROM tasks
)
UPDATE tasks
SET priority_order = ranked_tasks.rn
FROM ranked_tasks
WHERE tasks.id = ranked_tasks.id;
