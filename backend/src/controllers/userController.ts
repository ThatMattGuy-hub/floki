import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { supabase, supabaseAdmin } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

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

export const createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, full_name, role = UserRole.VIEWER } = req.body;

  // Validate role - don't allow creating Owner role
  if (role === UserRole.OWNER) {
    return res.status(400).json({
      success: false,
      error: 'Cannot create users with Owner role'
    });
  }

  // Create auth user with Supabase
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError || !authData.user) {
    logger.error('User creation error:', authError);
    return res.status(400).json({
      success: false,
      error: authError?.message || 'Failed to create user'
    });
  }

  // Create user record in our users table
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      full_name,
      role
    })
    .select()
    .single();

  if (userError) {
    logger.error('User profile creation error:', userError);
    // Clean up auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return res.status(400).json({
      success: false,
      error: 'Failed to create user profile'
    });
  }

  res.status(201).json({
    success: true,
    data: userData,
    message: 'User created successfully'
  });
});

export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { full_name, role, is_active } = req.body;

  // Can't modify Owner role
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', id)
    .single();

  if (existingUser?.role === UserRole.OWNER) {
    return res.status(403).json({
      success: false,
      error: 'Cannot modify Owner user'
    });
  }

  // Don't allow setting role to Owner
  if (role === UserRole.OWNER) {
    return res.status(400).json({
      success: false,
      error: 'Cannot assign Owner role'
    });
  }

  const updateData: any = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (role !== undefined) updateData.role = role;
  if (is_active !== undefined) updateData.is_active = is_active;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('User update error:', error);
    return res.status(400).json({
      success: false,
      error: 'Failed to update user'
    });
  }

  res.json({
    success: true,
    data,
    message: 'User updated successfully'
  });
});

export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Can't delete Owner
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', id)
    .single();

  if (existingUser?.role === UserRole.OWNER) {
    return res.status(403).json({
      success: false,
      error: 'Cannot delete Owner user'
    });
  }

  // Soft delete - just deactivate the user
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    logger.error('User deletion error:', error);
    return res.status(400).json({
      success: false,
      error: 'Failed to delete user'
    });
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

