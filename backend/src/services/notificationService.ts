import { supabaseAdmin } from '../config/supabase';
import { sendEmail } from './emailService';
import logger from '../config/logger';
import { NotificationType } from '../types';

interface NotificationPayload {
  recipient_id: string;
  notification_type: NotificationType;
  subject: string;
  body: string;
  entity_type?: string;
  entity_id?: string;
}

interface TaskNotificationContext {
  task_id: string;
  actor_id: string;
  notification_type: NotificationType;
  additional_data?: any;
}

export async function createNotification(payload: NotificationPayload) {
  logger.info('createNotification called with payload:', JSON.stringify(payload));
  
  try {
    // Check user notification preferences
    const { data: settings } = await supabaseAdmin
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', payload.recipient_id)
      .single();

    // Check if this notification type is enabled for the user
    const shouldSend = checkNotificationPreference(settings, payload.notification_type);
    
    if (!shouldSend) {
      logger.info(`Notification skipped for user ${payload.recipient_id} due to preferences`);
      return null;
    }

    // Create notification record
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert(payload)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create notification:', error);
      return null;
    }

    // Send email asynchronously
    sendEmailNotification(notification);

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    return null;
  }
}

function checkNotificationPreference(settings: any, type: NotificationType): boolean {
  if (!settings) return true; // Default to sending if no preferences set

  switch (type) {
    case NotificationType.ASSIGNMENT:
      return settings.enable_assignment;
    case NotificationType.MENTION:
      return settings.enable_mentions;
    case NotificationType.SLA_ALERT:
      return settings.enable_sla_alerts;
    case NotificationType.APPROVAL:
      return settings.enable_approval_changes;
    case NotificationType.STATUS_CHANGE:
      return settings.enable_status_changes;
    case NotificationType.COMMENT:
      return settings.enable_comments;
    default:
      return true;
  }
}

async function sendEmailNotification(notification: any) {
  logger.info('sendEmailNotification called for notification:', notification.id);
  
  try {
    // Get recipient email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email, full_name')
      .eq('id', notification.recipient_id)
      .single();

    if (!user) {
      logger.error('User not found for notification:', notification.recipient_id);
      return;
    }

    logger.info('Sending email to:', user.email, 'Subject:', notification.subject);

    // Send email
    const result = await sendEmail({
      to: user.email,
      subject: notification.subject,
      text: notification.body,
      html: notification.body.replace(/\n/g, '<br>')
    });

    logger.info('Email send result:', result);

    // Log email delivery
    await supabaseAdmin
      .from('email_logs')
      .insert({
        notification_id: notification.id,
        recipient_email: user.email,
        subject: notification.subject,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error,
        sent_at: result.success ? new Date().toISOString() : null
      });

    if (result.success) {
      // Update notification as sent
      await supabaseAdmin
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notification.id);
    }
  } catch (error) {
    logger.error('Error sending email notification:', error);
    
    // Log failed email
    await supabaseAdmin
      .from('email_logs')
      .insert({
        notification_id: notification.id,
        recipient_email: 'unknown',
        subject: notification.subject,
        status: 'failed',
        error_message: String(error)
      });
  }
}

export async function notifyTaskAssignment(taskId: string, assigneeId: string, actorId: string) {
  try {
    // Get task details
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        project:projects(name),
        product:products(name)
      `)
      .eq('id', taskId)
      .single();

    if (!task) return;

    // Get template
    const { data: template } = await supabaseAdmin
      .from('notification_templates')
      .select('*')
      .eq('notification_type', NotificationType.ASSIGNMENT)
      .eq('is_active', true)
      .single();

    if (!template) return;

    // Get actor details
    const { data: actor } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', actorId)
      .single();

    // Replace template variables
    const subject = replaceTemplateVariables(template.subject_template, { task, actor });
    const body = replaceTemplateVariables(template.body_template, { task, actor });

    await createNotification({
      recipient_id: assigneeId,
      notification_type: NotificationType.ASSIGNMENT,
      subject,
      body,
      entity_type: 'task',
      entity_id: taskId
    });
  } catch (error) {
    logger.error('Error notifying task assignment:', error);
  }
}

export async function notifyMention(taskId: string, mentionedUserId: string, commentContent: string, actorId: string) {
  // Don't notify if user mentioned themselves
  // if (mentionedUserId === actorId) {
  //   logger.info('Skipping self-mention notification');
  //   return;
  // }

  try {
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        project:projects(name),
        product:products(name)
      `)
      .eq('id', taskId)
      .single();

    if (!task) {
      logger.warn('Task not found for mention notification:', taskId);
      return;
    }

    const { data: actor } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', actorId)
      .single();

    // Try to get template, but use fallback if not found
    const { data: template } = await supabaseAdmin
      .from('notification_templates')
      .select('*')
      .eq('notification_type', 'mention')
      .eq('is_active', true)
      .single();

    let subject: string;
    let body: string;

    if (template) {
      subject = replaceTemplateVariables(template.subject_template, { task, actor, comment: { content: commentContent } });
      body = replaceTemplateVariables(template.body_template, { task, actor, comment: { content: commentContent } });
    } else {
      // Fallback if no template
      subject = `You were mentioned in: ${task.title}`;
      body = `${actor?.full_name || 'Someone'} mentioned you in a comment on "${task.title}":\n\n"${commentContent}"`;
      logger.warn('No mention template found, using fallback');
    }

    await createNotification({
      recipient_id: mentionedUserId,
      notification_type: NotificationType.MENTION,
      subject,
      body,
      entity_type: 'task',
      entity_id: taskId
    });

    logger.info('Mention notification created for user:', mentionedUserId);
  } catch (error) {
    logger.error('Error notifying mention:', error);
  }
}

export async function notifyStatusChange(taskId: string, oldStatusId: string, newStatusId: string, actorId: string) {
  try {
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        project:projects(name),
        product:products(name),
        assignee:users(id, email),
        watchers:watchers(user_id)
      `)
      .eq('id', taskId)
      .single();

    if (!task) return;

    const [{ data: oldStatus }, { data: newStatus }] = await Promise.all([
      supabaseAdmin.from('statuses').select('name').eq('id', oldStatusId).single(),
      supabaseAdmin.from('statuses').select('name').eq('id', newStatusId).single()
    ]);

    const { data: template } = await supabaseAdmin
      .from('notification_templates')
      .select('*')
      .eq('notification_type', NotificationType.STATUS_CHANGE)
      .eq('is_active', true)
      .single();

    if (!template) return;

    const { data: actor } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', actorId)
      .single();

    const subject = replaceTemplateVariables(template.subject_template, { task, actor });
    const body = replaceTemplateVariables(template.body_template, { 
      task, 
      actor, 
      old_status: oldStatus?.name, 
      new_status: newStatus?.name 
    });

    // Notify assignee and watchers
    const recipients = new Set<string>();
    if (task.assignee?.id) recipients.add(task.assignee.id);
    task.watchers?.forEach((w: any) => recipients.add(w.user_id));
    recipients.delete(actorId); // Don't notify the actor

    for (const recipientId of recipients) {
      await createNotification({
        recipient_id: recipientId,
        notification_type: NotificationType.STATUS_CHANGE,
        subject,
        body,
        entity_type: 'task',
        entity_id: taskId
      });
    }
  } catch (error) {
    logger.error('Error notifying status change:', error);
  }
}

function replaceTemplateVariables(template: string, context: any): string {
  let result = template;
  
  // Replace task variables
  if (context.task) {
    result = result.replace(/\{\{task\.title\}\}/g, context.task.title || '');
    result = result.replace(/\{\{task\.due_date\}\}/g, context.task.due_date || 'No due date');
    result = result.replace(/\{\{task\.priority\}\}/g, String(context.task.priority || 0));
    result = result.replace(/\{\{project\.name\}\}/g, context.task.project?.name || '');
    result = result.replace(/\{\{product\.name\}\}/g, context.task.product?.name || '');
  }

  // Replace actor variables
  if (context.actor) {
    result = result.replace(/\{\{actor\.name\}\}/g, context.actor.full_name || 'Someone');
  }

  // Replace comment variables
  if (context.comment) {
    result = result.replace(/\{\{comment\.content\}\}/g, context.comment.content || '');
  }

  // Replace status variables
  result = result.replace(/\{\{old_status\}\}/g, context.old_status || '');
  result = result.replace(/\{\{new_status\}\}/g, context.new_status || '');

  // Replace recipient variables
  if (context.recipient) {
    result = result.replace(/\{\{recipient\.name\}\}/g, context.recipient.full_name || 'there');
  }

  return result;
}

export async function notifyWatcherAdded(taskId: string, watcherId: string, actorId: string) {
  // Don't notify if user added themselves as watcher
  if (watcherId === actorId) return;

  try {
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        project:projects(name),
        product:products(name)
      `)
      .eq('id', taskId)
      .single();

    if (!task) return;

    const { data: actor } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', actorId)
      .single();

    const subject = `You've been added as a watcher on: ${task.title}`;
    const body = `${actor?.full_name || 'Someone'} added you as a watcher on the task "${task.title}" in project ${task.project?.name || 'Unknown'}.

You will now receive notifications about updates to this task.`;

    await createNotification({
      recipient_id: watcherId,
      notification_type: NotificationType.WATCHER,
      subject,
      body,
      entity_type: 'task',
      entity_id: taskId
    });
  } catch (error) {
    logger.error('Error notifying watcher added:', error);
  }
}

// Export notification helpers
export const notifications = {
  taskAssignment: notifyTaskAssignment,
  mention: notifyMention,
  statusChange: notifyStatusChange,
  watcherAdded: notifyWatcherAdded
};

