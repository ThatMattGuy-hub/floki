import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/audit';
import logger from '../config/logger';

export const getAgencies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { search } = req.query;

  let query = supabaseAdmin
    .from('agencies')
    .select('*')
    .order('name');

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to fetch agencies:', error);
    throw new AppError('Failed to fetch agencies', 500);
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const createAgency = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;

  // Only Owner, Admin, Manager can create agencies
  if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to create agencies'
    });
  }

  const { name, description, contact_email, contact_phone } = req.body;

  // Validate required fields
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Agency name is required'
    });
  }

  // Build insert object with only fields that exist in the schema
  // Schema: id, name, description, contact_email, is_active, created_at, updated_at
  const insertData: any = {
    name: name.trim(),
    is_active: true  // Default to active when creating
  };

  // Only include optional fields if they're provided
  if (description !== undefined) {
    insertData.description = description?.trim() || null;
  }
  if (contact_email !== undefined) {
    insertData.contact_email = contact_email?.trim() || null;
  }

  const { data, error } = await supabaseAdmin
    .from('agencies')
    .insert(insertData)
    .select('*')
    .single();

  if (error) {
    logger.error('Failed to create agency:', { error, details: error.message, hint: error.hint, code: error.code });
    throw new AppError(`Failed to create agency: ${error.message}`, 500);
  }

  const responseData = { ...data };

  await logActivity(userId, 'agency_created', 'agencies', data.id, {
    agency_name: name
  });

  res.status(201).json({ success: true, data: responseData });
});

export const updateAgency = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;
  const { id } = req.params;
  const { name, description, contact_email, contact_phone } = req.body;

  // Check permissions
  if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to update agencies'
    });
  }

  // Build update object with only fields that exist in the schema
  // Schema: id, name, description, contact_email, is_active, created_at, updated_at
  const updateData: any = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (contact_email !== undefined) updateData.contact_email = contact_email?.trim() || null;

  const { data, error } = await supabaseAdmin
    .from('agencies')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    logger.error('Failed to update agency:', error);
    throw new AppError('Failed to update agency', 500);
  }

  const responseData = { ...data };

  await logActivity(userId, 'agency_updated', 'agencies', id, {
    agency_name: name
  });

  res.json({ success: true, data: responseData });
});

export const getAgencyById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Get agency
  const { data: agency, error: agencyError } = await supabaseAdmin
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single();

  if (agencyError || !agency) {
    logger.error('Failed to fetch agency:', agencyError);
    throw new AppError('Agency not found', 404);
  }

  // Get teams for this agency
  const { data: teams, error: teamsError } = await supabaseAdmin
    .from('teams')
    .select('*')
    .eq('agency_id', id)
    .order('name');

  if (teamsError) {
    logger.error('Failed to fetch teams:', teamsError);
    throw new AppError('Failed to fetch teams', 500);
  }

  // Get members for each team
  const teamsWithMembers = await Promise.all((teams || []).map(async (team: any) => {
    const { data: members } = await supabaseAdmin
      .from('team_members')
      .select(`
        user:users(id, email, full_name, role, is_active)
      `)
      .eq('team_id', team.id);

    return {
      ...team,
      members: members?.map((m: any) => m.user).filter((u: any) => u) || []
    };
  }));

  // Flatten all users from all teams
  const allUsers = new Map<string, any>();
  teamsWithMembers.forEach((team: any) => {
    team.members.forEach((user: any) => {
      if (!allUsers.has(user.id)) {
        allUsers.set(user.id, {
          ...user,
          teams: [team.name]
        });
      } else {
        const existingUser = allUsers.get(user.id);
        existingUser.teams.push(team.name);
      }
    });
  });

  const responseData = {
    ...agency,
    teams: teamsWithMembers,
    users: Array.from(allUsers.values())
  };

  res.json({
    success: true,
    data: responseData
  });
});

export const deleteAgency = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;
  const { id } = req.params;

  // Only Owner and Admin can delete agencies
  if (!['owner', 'admin'].includes(userRole?.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to delete agencies'
    });
  }

  const { error } = await supabaseAdmin
    .from('agencies')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Failed to delete agency:', error);
    throw new AppError('Failed to delete agency', 500);
  }

  await logActivity(userId, 'agency_deleted', 'agencies', id);

  res.json({ success: true });
});

