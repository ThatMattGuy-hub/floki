-- Create automations table for storing automation rules
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger JSONB NOT NULL DEFAULT '{}',
  conditions JSONB DEFAULT '[]',
  condition_logic VARCHAR(10) DEFAULT 'all', -- 'all' (AND) or 'any' (OR)
  actions JSONB NOT NULL DEFAULT '[]',
  is_enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_automations_is_enabled ON automations(is_enabled);
CREATE INDEX IF NOT EXISTS idx_automations_trigger ON automations USING GIN (trigger);
CREATE INDEX IF NOT EXISTS idx_automations_created_by ON automations(created_by);

-- Create automation_logs table to track automation executions
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  triggered_by UUID REFERENCES users(id),
  trigger_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'success', -- 'success', 'failed', 'skipped'
  error_message TEXT,
  actions_executed JSONB DEFAULT '[]',
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_automation ON automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_task ON automation_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed ON automation_logs(executed_at);

-- Add comment
COMMENT ON TABLE automations IS 'Stores automation rules (WHEN trigger THEN actions)';
COMMENT ON TABLE automation_logs IS 'Logs of automation executions for debugging and auditing';
