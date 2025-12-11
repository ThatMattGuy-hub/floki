import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';
import { logActivity } from '../utils/audit';

export const getStatuses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('statuses')
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

export const createStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, color, order_index, is_default, is_closed } = req.body;

  const { data, error } = await supabaseAdmin
    .from('statuses')
    .insert({ name, color, order_index, is_default, is_closed })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity({
    actor_id: req.user!.id,
    action: 'create',
    entity_type: 'status',
    entity_id: data.id,
    details: `Created status: ${name}`
  });

  res.json({
    success: true,
    data
  });
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, color, order_index, is_default, is_closed } = req.body;

  const { data, error } = await supabaseAdmin
    .from('statuses')
    .update({ name, color, order_index, is_default, is_closed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity({
    actor_id: req.user!.id,
    action: 'update',
    entity_type: 'status',
    entity_id: id,
    details: `Updated status: ${name}`
  });

  res.json({
    success: true,
    data
  });
});

export const deleteStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('statuses')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  await logActivity({
    actor_id: req.user!.id,
    action: 'delete',
    entity_type: 'status',
    entity_id: id,
    details: 'Deleted status'
  });

  res.json({
    success: true,
    message: 'Status deleted successfully'
  });
});
