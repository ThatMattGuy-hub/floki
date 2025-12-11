import { supabaseAdmin } from '../config/supabase';
import logger from '../config/logger';

/**
 * Log an activity to the audit_logs table
 */
export const logActivity = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || null
      });

    if (error) {
      logger.error('Failed to log activity', { error, userId, action, entityType, entityId });
    }
  } catch (error) {
    logger.error('Exception in logActivity', { error, userId, action, entityType, entityId });
  }
};

/**
 * Get audit logs for a specific entity
 */
export const getEntityAuditLogs = async (
  entityType: string,
  entityId: string,
  limit: number = 50
) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*, user:users(id, email, full_name)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  } catch (error) {
    logger.error('Failed to get entity audit logs', { error, entityType, entityId });
    throw error;
  }
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (
  userId: string,
  limit: number = 50
) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  } catch (error) {
    logger.error('Failed to get user audit logs', { error, userId });
    throw error;
  }
};

/**
 * Get recent audit logs across the system
 */
export const getRecentAuditLogs = async (limit: number = 100) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*, user:users(id, email, full_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  } catch (error) {
    logger.error('Failed to get recent audit logs', { error });
    throw error;
  }
};

