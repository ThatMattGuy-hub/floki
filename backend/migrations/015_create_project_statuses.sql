-- Create project_statuses table for configurable project statuses
CREATE TABLE IF NOT EXISTS project_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default project statuses (matching existing hardcoded values)
INSERT INTO project_statuses (name, slug, color, order_index, is_default, is_closed, description) VALUES
    ('Ongoing', 'ongoing', '#3B82F6', 1, TRUE, FALSE, 'Project is actively being worked on'),
    ('On Hold', 'on_hold', '#F59E0B', 2, FALSE, FALSE, 'Project is temporarily paused'),
    ('Blocked', 'blocked', '#EF4444', 3, FALSE, FALSE, 'Project is blocked by external factors'),
    ('Done', 'done', '#10B981', 4, FALSE, TRUE, 'Project has been completed'),
    ('Cancelled', 'cancelled', '#6B7280', 5, FALSE, TRUE, 'Project has been cancelled')
ON CONFLICT (slug) DO NOTHING;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_project_statuses_order ON project_statuses(order_index);

-- Enable RLS
ALTER TABLE project_statuses ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read project statuses
CREATE POLICY "Authenticated users can read project statuses"
    ON project_statuses FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only admins can manage project statuses
CREATE POLICY "Admins can manage project statuses"
    ON project_statuses FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        )
    );
