import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/audit';
import logger from '../config/logger';

export const getTeams = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { agency_id, include_members } = req.query;

  let query = supabaseAdmin
    .from('teams')
    .select(include_members === 'true' 
      ? '*, team_members(user:users(id, email, full_name, role, is_active))'
      : '*'
    )
    .order('name');

  if (agency_id) {
    query = query.eq('agency_id', agency_id as string);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to fetch teams:', error);
    throw new AppError('Failed to fetch teams', 500);
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const getTeamById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { data: team, error } = await supabaseAdmin
    .from('teams')
    .select('*, team_members(user:users(id, email, full_name, role, is_active))')
    .eq('id', id)
    .single();

  if (error || !team) {
    logger.error('Failed to fetch team:', error);
    throw new AppError('Team not found', 404);
  }

  res.json({
    success: true,
    data: team
  });
});

export const createTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;

  // Only Owner, Admin, Manager can create teams
  if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to create teams'
    });
  }

  const { name, description, is_agency_team, agency_id } = req.body;

  const { data, error } = await supabaseAdmin
    .from('teams')
    .insert({
      name,
      description,
      is_agency_team: is_agency_team || false,
      agency_id: agency_id || null
    })
    .select('*')
    .single();

  if (error) {
    logger.error('Failed to create team:', error);
    throw new AppError('Failed to create team', 500);
  }

  await logActivity(userId, 'team_created', 'teams', data.id, {
    team_name: name
  });

  res.status(201).json({
    success: true,
    data
  });
});

export const updateTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;
  const { id } = req.params;
  const { name, description, is_agency_team, agency_id } = req.body;

  // Check permissions
  if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to update teams'
    });
  }

  const { data, error } = await supabaseAdmin
    .from('teams')
    .update({
      name,
      description,
      is_agency_team,
      agency_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    logger.error('Failed to update team:', error);
    throw new AppError('Failed to update team', 500);
  }

  await logActivity(userId, 'team_updated', 'teams', id, {
    team_name: name
  });

  res.json({
    success: true,
    data
  });
});

export const deleteTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;
  const { id } = req.params;

  // Only Owner and Admin can delete teams
  if (!['owner', 'admin'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to delete teams'
    });
  }

  const { error } = await supabaseAdmin
    .from('teams')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Failed to delete team:', error);
    throw new AppError('Failed to delete team', 500);
  }

  await logActivity(userId, 'team_deleted', 'teams', id);

  res.json({
    success: true,
    message: 'Team deleted successfully'
  });
});

// Team Membership Management
export const getTeamMembers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .select('user:users(id, email, full_name, role, is_active, avatar_url)')
    .eq('team_id', id);

  if (error) {
    logger.error('Failed to fetch team members:', error);
    throw new AppError('Failed to fetch team members', 500);
  }

  res.json({
    success: true,
    data: data?.map((member: any) => member.user) || []
  });
});

export const addTeamMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;
  const { id } = req.params;
  const { user_id } = req.body;

  // Check permissions
  if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to manage team members'
    });
  }

  // Check if user is already a member
  const { data: existing } = await supabaseAdmin
    .from('team_members')
    .select('id')
    .eq('team_id', id)
    .eq('user_id', user_id)
    .single();

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'User is already a member of this team'
    });
  }

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .insert({
      team_id: id,
      user_id
    })
    .select('user:users(id, email, full_name, role, is_active)')
    .single();

  if (error) {
    logger.error('Failed to add team member:', error);
    throw new AppError('Failed to add team member', 500);
  }

  await logActivity(userId, 'team_member_added', 'teams', id, {
    user_id,
    team_id: id
  });

  res.status(201).json({
    success: true,
    data: data.user
  });
});

export const removeTeamMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;
  const { id, user_id } = req.params;

  // Check permissions
  if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to manage team members'
    });
  }

  const { error } = await supabaseAdmin
    .from('team_members')
    .delete()
    .eq('team_id', id)
    .eq('user_id', user_id);

  if (error) {
    logger.error('Failed to remove team member:', error);
    throw new AppError('Failed to remove team member', 500);
  }

  await logActivity(userId, 'team_member_removed', 'teams', id, {
    user_id,
    team_id: id
  });

  res.json({
    success: true,
    message: 'Team member removed successfully'
  });
});

export const getUserTeams = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .select('team:teams(id, name, description, is_agency_team)')
    .eq('user_id', id);

  if (error) {
    logger.error('Failed to fetch user teams:', error);
    throw new AppError('Failed to fetch user teams', 500);
  }

  res.json({
    success: true,
    data: data?.map((member: any) => member.team) || []
  });
});

