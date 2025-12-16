-- Create project_teams junction table for assigning multiple teams to a project
CREATE TABLE IF NOT EXISTS project_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, team_id)
);

-- Create indexes for project_teams
CREATE INDEX IF NOT EXISTS idx_project_teams_project ON project_teams(project_id);
CREATE INDEX IF NOT EXISTS idx_project_teams_team ON project_teams(team_id);

-- Create project_products junction table for assigning multiple products to a project
CREATE TABLE IF NOT EXISTS project_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, product_id)
);

-- Create indexes for project_products
CREATE INDEX IF NOT EXISTS idx_project_products_project ON project_products(project_id);
CREATE INDEX IF NOT EXISTS idx_project_products_product ON project_products(product_id);

-- Migrate existing product_id data to project_products junction table
-- This preserves existing project-product relationships
INSERT INTO project_products (project_id, product_id, is_primary)
SELECT id, product_id, TRUE
FROM projects
WHERE product_id IS NOT NULL
ON CONFLICT (project_id, product_id) DO NOTHING;

-- Note: We keep the product_id column on projects for now for backwards compatibility
-- It can be removed in a future migration after all code is updated
