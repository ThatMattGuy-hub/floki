import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';
import { logActivity } from '../utils/audit';

export const getLabels = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('labels')
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

export const createLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, color, description } = req.body;

  const { data, error } = await supabaseAdmin
    .from('labels')
    .insert({ name, color, description })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'create',
    'label',
    data.id,
    { details: `Created label: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const updateLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, color, description } = req.body;

  const { data, error } = await supabaseAdmin
    .from('labels')
    .update({ name, color, description, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'update',
    'label',
    id,
    { details: `Updated label: ${name}` }
  );

  res.json({
    success: true,
    data
  });
});

export const deleteLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('labels')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  await logActivity(
    req.user!.id,
    'delete',
    'label',
    id,
    { details: 'Deleted label' }
  );

  res.json({
    success: true,
    message: 'Label deleted successfully'
  });
});

