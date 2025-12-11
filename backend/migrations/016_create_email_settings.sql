-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL DEFAULT 'custom',
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_password VARCHAR(255),
    smtp_secure BOOLEAN DEFAULT true,
    tenant_id VARCHAR(255),
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) DEFAULT 'Project Management System',
    reply_to VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify email settings
CREATE POLICY "Admins can manage email_settings"
ON email_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('Owner', 'Admin')
    )
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_email_settings_provider ON email_settings(provider);
