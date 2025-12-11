import { Response } from 'express';
import nodemailer from 'nodemailer';
import { AuthenticatedRequest } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';
import { logActivity } from '../utils/audit';

// Custom Fields
export const getCustomFields = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('custom_fields')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const createCustomField = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, type, description, is_internal_only, is_required, options } = req.body;

  const { data, error } = await supabaseAdmin
    .from('custom_fields')
    .insert({ name, type, description, is_internal_only, is_required, options })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'create',
    'custom_field',
    data.id,
    { details: `Created custom field: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const updateCustomField = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, type, description, is_internal_only, is_required, options } = req.body;

  const { data, error } = await supabaseAdmin
    .from('custom_fields')
    .update({ name, type, description, is_internal_only, is_required, options, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'update',
    'custom_field',
    id,
    { details: `Updated custom field: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const deleteCustomField = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('custom_fields')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'delete',
    'custom_field',
    id,
    { details: 'Deleted custom field' }
  );

  res.json({
    success: true,
    message: 'Custom field deleted successfully'
  });
});

// Task Custom Field Values
export const getTaskCustomFieldValues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('task_custom_field_values')
    .select('*')
    .eq('task_id', task_id);

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const updateTaskCustomFieldValues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;
  const { values } = req.body; // Array of { custom_field_id, value }

  if (!Array.isArray(values)) {
    return res.status(400).json({ success: false, error: 'Values must be an array' });
  }

  // Upsert each value
  for (const item of values) {
    const { custom_field_id, value } = item;

    const { error } = await supabaseAdmin
      .from('task_custom_field_values')
      .upsert({
        task_id,
        custom_field_id,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'task_id,custom_field_id'
      });

    if (error) {
      throw error;
    }
  }

  // Fetch updated values (without join, we'll merge manually)
  const { data: fieldValues, error: fetchError } = await supabaseAdmin
    .from('task_custom_field_values')
    .select('*')
    .eq('task_id', task_id);

  if (fetchError) {
    throw fetchError;
  }

  res.json({
    success: true,
    data: fieldValues || []
  });
});

// Automations
export const getAutomations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('automations')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const createAutomation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, trigger, conditions, actions, is_enabled } = req.body;

  const { data, error } = await supabaseAdmin
    .from('automations')
    .insert({ name, trigger, conditions, actions, is_enabled })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'create',
    'automation',
    data.id,
    { details: `Created automation: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const updateAutomation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, trigger, conditions, actions, is_enabled } = req.body;

  const { data, error } = await supabaseAdmin
    .from('automations')
    .update({ name, trigger, conditions, actions, is_enabled, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'update',
    'automation',
    id,
    { details: `Updated automation: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const deleteAutomation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('automations')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'delete',
    'automation',
    id,
    { details: 'Deleted automation' }
  );

  res.json({
    success: true,
    message: 'Automation deleted successfully'
  });
});

// Approval Workflows
export const getApprovalWorkflows = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('approval_workflows')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const createApprovalWorkflow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, approval_type, applies_to, steps, is_active } = req.body;

  const { data, error } = await supabaseAdmin
    .from('approval_workflows')
    .insert({ name, description, approval_type, applies_to, steps, is_active })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'create',
    'approval_workflow',
    data.id,
    { details: `Created approval workflow: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const updateApprovalWorkflow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, approval_type, applies_to, steps, is_active } = req.body;

  const { data, error } = await supabaseAdmin
    .from('approval_workflows')
    .update({ name, description, approval_type, applies_to, steps, is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'update',
    'approval_workflow',
    id,
    { details: `Updated approval workflow: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const deleteApprovalWorkflow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('approval_workflows')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'delete',
    'approval_workflow',
    id,
    { details: 'Deleted approval workflow' }
  );

  res.json({
    success: true,
    message: 'Approval workflow deleted successfully'
  });
});

// SLA Rules
export const getSLARules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('sla_rules')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const createSLARule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, threshold_value, threshold_unit, applies_to, alert_before_hours, is_active } = req.body;

  const { data, error } = await supabaseAdmin
    .from('sla_rules')
    .insert({ name, description, threshold_value, threshold_unit, applies_to, alert_before_hours, is_active })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'create',
    'sla_rule',
    data.id,
    { details: `Created SLA rule: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const updateSLARule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, threshold_value, threshold_unit, applies_to, alert_before_hours, is_active } = req.body;

  const { data, error } = await supabaseAdmin
    .from('sla_rules')
    .update({ name, description, threshold_value, threshold_unit, applies_to, alert_before_hours, is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'update',
    'sla_rule',
    id,
    { details: `Updated SLA rule: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const deleteSLARule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('sla_rules')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'delete',
    'sla_rule',
    id,
    { details: 'Deleted SLA rule' }
  );

  res.json({
    success: true,
    message: 'SLA rule deleted successfully'
  });
});

// Email Settings
export const getEmailSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('email_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }

  res.json({
    success: true,
    data: data || null
  });
});

export const saveEmailSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const settings = req.body;

  // Check if settings exist
  const { data: existing } = await supabaseAdmin
    .from('email_settings')
    .select('id')
    .single();

  let data;
  if (existing) {
    const { data: updated, error } = await supabaseAdmin
      .from('email_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    data = updated;
  } else {
    const { data: created, error } = await supabaseAdmin
      .from('email_settings')
      .insert(settings)
      .select()
      .single();

    if (error) throw error;
    data = created;
  }

  await logActivity(
    req.user!.id,
    'update',
    'email_settings',
    data.id,
    { details: 'Updated email settings' }
  );

  res.json({
    success: true,
    data
  });
});

export const testEmailConnection = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    provider, 
    smtp_host, 
    smtp_port, 
    smtp_user, 
    smtp_password, 
    smtp_secure,
    from_email,
    from_name
  } = req.body;

  if (provider === 'microsoft_graph') {
    // Microsoft Graph API testing would require OAuth flow
    res.json({
      success: true,
      message: 'Microsoft Graph API configuration saved. OAuth verification required separately.'
    });
    return;
  }

  // Test SMTP connection
  try {
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: smtp_user,
        pass: smtp_password
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certs for testing
      }
    });

    // Verify connection
    await transporter.verify();

    // Optionally send a test email to the from_email address
    const testEmail = req.query.sendTest === 'true';
    
    if (testEmail && from_email) {
      await transporter.sendMail({
        from: `"${from_name || 'Test'}" <${smtp_user}>`,
        to: from_email,
        subject: 'Test Email - Project Management System',
        text: 'This is a test email to verify your SMTP configuration is working correctly.',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>✅ Email Configuration Test Successful</h2>
            <p>This is a test email from your Project Management System.</p>
            <p>If you received this email, your SMTP settings are configured correctly.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `
      });

      res.json({
        success: true,
        message: `Connection verified and test email sent to ${from_email}`
      });
    } else {
      res.json({
        success: true,
        message: 'SMTP connection verified successfully'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: `Email connection failed: ${error.message}`
    });
  }
});

// Email Templates
export const getEmailTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('notification_templates')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const updateEmailTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { subject_template, body_template, is_active } = req.body;

  const { data, error } = await supabaseAdmin
    .from('notification_templates')
    .update({ 
      subject_template, 
      body_template, 
      is_active,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data
  });
});

// Audit Logs
export const getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { actor, entity_type, from_date, to_date, page = 1, limit = 50 } = req.query;

  let query = supabaseAdmin
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (actor) {
    query = query.or(`actor_id.eq.${actor},actor_email.ilike.%${actor}%`);
  }
  if (entity_type) {
    query = query.eq('entity_type', entity_type);
  }
  if (from_date) {
    query = query.gte('created_at', from_date);
  }
  if (to_date) {
    query = query.lte('created_at', to_date);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum)
    }
  });
});

export const exportAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { actor, entity_type, from_date, to_date } = req.query;

  let query = supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (actor) {
    query = query.or(`actor_id.eq.${actor},actor_email.ilike.%${actor}%`);
  }
  if (entity_type) {
    query = query.eq('entity_type', entity_type);
  }
  if (from_date) {
    query = query.gte('created_at', from_date);
  }
  if (to_date) {
    query = query.lte('created_at', to_date);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Convert to CSV
  const headers = ['Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Details'];
  const rows = (data || []).map(log => [
    log.created_at,
    log.actor_email || log.actor_id || 'System',
    log.action,
    log.entity_type || '',
    log.entity_id || '',
    log.details || ''
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

// Project Statuses
export const getProjectStatuses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('project_statuses')
    .select('*')
    .order('order_index');

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const createProjectStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, color, description, order_index, is_default, is_closed } = req.body;

  // If setting as default, unset other defaults
  if (is_default) {
    await supabaseAdmin
      .from('project_statuses')
      .update({ is_default: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }

  const { data, error } = await supabaseAdmin
    .from('project_statuses')
    .insert({ 
      name, 
      slug: slug || name.toLowerCase().replace(/\s+/g, '_'),
      color: color || '#6B7280', 
      description, 
      order_index: order_index || 0, 
      is_default: is_default || false, 
      is_closed: is_closed || false 
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'create',
    'project_status',
    data.id,
    { details: `Created project status: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const updateProjectStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, slug, color, description, order_index, is_default, is_closed } = req.body;

  // If setting as default, unset other defaults
  if (is_default) {
    await supabaseAdmin
      .from('project_statuses')
      .update({ is_default: false })
      .neq('id', id);
  }

  const { data, error } = await supabaseAdmin
    .from('project_statuses')
    .update({ 
      name, 
      slug,
      color, 
      description, 
      order_index, 
      is_default, 
      is_closed,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'update',
    'project_status',
    id,
    { details: `Updated project status: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const deleteProjectStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if any projects are using this status
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('status', id)
    .limit(1);

  if (projects && projects.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete status that is in use by projects'
    });
  }

  const { error } = await supabaseAdmin
    .from('project_statuses')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'delete',
    'project_status',
    id,
    { details: 'Deleted project status' }
  );

  res.json({
    success: true
  });
});

