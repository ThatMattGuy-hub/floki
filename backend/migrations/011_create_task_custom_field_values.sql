-- Create task_custom_field_values table to store custom field values for tasks
CREATE TABLE IF NOT EXISTS task_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, custom_field_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_task ON task_custom_field_values(task_id);
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_field ON task_custom_field_values(custom_field_id);
