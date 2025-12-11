-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type VARCHAR(50) NOT NULL UNIQUE,
    subject_template VARCHAR(500) NOT NULL,
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user notification settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    enable_assignment BOOLEAN DEFAULT true,
    enable_mentions BOOLEAN DEFAULT true,
    enable_status_changes BOOLEAN DEFAULT true,
    enable_comments BOOLEAN DEFAULT true,
    enable_sla_alerts BOOLEAN DEFAULT true,
    enable_approval_changes BOOLEAN DEFAULT true,
    enable_watcher BOOLEAN DEFAULT true,
    email_frequency VARCHAR(20) DEFAULT 'instant', -- instant, daily, weekly
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL, -- sent, failed, pending
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_notification ON email_logs(notification_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications (users can only see their own)
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (recipient_id = auth.uid());

-- RLS for notification_templates (admins only)
CREATE POLICY "Admins can manage notification_templates"
ON notification_templates FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('Owner', 'Admin')
    )
);

-- RLS for user_notification_settings
CREATE POLICY "Users can manage own notification settings"
ON user_notification_settings FOR ALL
USING (user_id = auth.uid());

-- RLS for email_logs (admins only)
CREATE POLICY "Admins can view email_logs"
ON email_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('Owner', 'Admin')
    )
);

-- Insert default notification templates
INSERT INTO notification_templates (notification_type, subject_template, body_template) VALUES
('assignment', 'You''ve been assigned to: {{task.title}}', '{{actor.name}} assigned you to the task "{{task.title}}" in project {{project.name}}.

Due date: {{task.due_date}}'),
('mention', 'You were mentioned in: {{task.title}}', '{{actor.name}} mentioned you in a comment on "{{task.title}}":

"{{comment.content}}"'),
('status_change', 'Task status changed: {{task.title}}', '{{actor.name}} changed the status of "{{task.title}}" from {{old_status}} to {{new_status}}.'),
('watcher', 'You''re now watching: {{task.title}}', '{{actor.name}} added you as a watcher on "{{task.title}}" in project {{project.name}}.

You will receive notifications about updates to this task.')
ON CONFLICT (notification_type) DO NOTHING;
