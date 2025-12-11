import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';

export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { search } = req.query;

  let query = supabaseAdmin
    .from('users')
    .select('id, email, full_name, avatar_url, role, is_active')
    .eq('is_active', true)
    .order('full_name');

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    data: data || []
  });
});

