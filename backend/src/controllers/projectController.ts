import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logActivity } from '../utils/audit';
import { getVisibleProjectsForExternalAgency } from '../utils/visibility';
import { UserRole, AuthenticatedRequest } from '../types';

export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { 
      product_id,
      owner_id,
      status,
      created_from,
      created_to,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;

    // Build query
    let query = supabaseAdmin
      .from('projects')
      .select('*, product:products(id, name), owner:users!owner_id(id, email, full_name), labels:project_labels(id, label:labels(*)), teams:project_teams(team:teams(*)), products:project_products(product:products(*), is_primary)');

    // Apply filters (handle array values by taking first element)
    if (product_id) {
      const pid = Array.isArray(product_id) ? product_id[0] : product_id;
      query = query.eq('product_id', pid);
    }
    if (owner_id) {
      const oid = Array.isArray(owner_id) ? owner_id[0] : owner_id;
      query = query.eq('owner_id', oid);
    }
    if (status) {
      const s = Array.isArray(status) ? status[0] : status;
      query = query.eq('status', s);
    }
    if (created_from) {
      query = query.gte('created_at', created_from as string);
    }
    if (created_to) {
      query = query.lte('created_at', created_to as string);
    }

    // Sorting
    const sortField = sort_by as string;
    const ascending = sort_order === 'asc';
    const validSortFields = ['name', 'created_at', 'updated_at', 'priority_order'];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'name';
    
    // For priority_order, ensure NULLs sort last (new items appear at bottom)
    if (finalSortField === 'priority_order') {
      query = query.order(finalSortField, { ascending, nullsFirst: false });
    } else {
      query = query.order(finalSortField, { ascending });
    }

    // If External Agency, filter by visibility
    if (userRole === UserRole.EXTERNAL_AGENCY) {
      const projectIds = await getVisibleProjectsForExternalAgency(userId);
      
      if (projectIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      query = query.in('id', projectIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Fetch task completion stats for all projects
    if (data && data.length > 0) {
      const projectIds = data.map((p: any) => p.id);
      
      // Get all tasks for these projects with their status
      const { data: tasks, error: tasksError } = await supabaseAdmin
        .from('tasks')
        .select('project_id, status:statuses(name)')
        .in('project_id', projectIds);
      
      if (!tasksError && tasks) {
        // Calculate stats per project
        const projectStats: Record<string, { total: number; completed: number }> = {};
        
        for (const task of tasks) {
          const pid = task.project_id;
          if (!projectStats[pid]) {
            projectStats[pid] = { total: 0, completed: 0 };
          }
          projectStats[pid].total++;
          
          // Check if task is completed (status name includes done/complete/closed)
          const statusName = (task.status as any)?.name?.toLowerCase() || '';
          if (statusName.includes('done') || statusName.includes('complete') || statusName.includes('closed')) {
            projectStats[pid].completed++;
          }
        }
        
        // Add stats to each project
        for (const project of data) {
          const stats = projectStats[project.id] || { total: 0, completed: 0 };
          project.total_tasks = stats.total;
          project.completed_tasks = stats.completed;
          project.task_progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        }
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, product:products(id, name), owner:users!owner_id(id, email, full_name), teams:project_teams(team:teams(*)), products:project_products(product:products(*), is_primary)')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only Owner, Admin, Manager can create projects
    if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create projects'
      });
    }

    const { product_id, name, description, owner_id, status, teams = [], products = [] } = req.body;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        product_id,
        name,
        description,
        owner_id: owner_id || userId,
        status: status || 'ongoing'
      })
      .select('*, product:products(id, name), owner:users!owner_id(id, email, full_name)')
      .single();

    if (error) throw error;

    // Add teams to project
    if (teams.length > 0) {
      const teamInserts = teams.map((teamId: string) => ({
        project_id: data.id,
        team_id: teamId
      }));
      await supabaseAdmin.from('project_teams').insert(teamInserts);
    }

    // Add products to project (in addition to primary product_id)
    if (products.length > 0) {
      const productInserts = products.map((productId: string, index: number) => ({
        project_id: data.id,
        product_id: productId,
        is_primary: index === 0 && !product_id
      }));
      await supabaseAdmin.from('project_products').insert(productInserts);
    }

    // Fetch full project with relations
    const { data: fullProject } = await supabaseAdmin
      .from('projects')
      .select('*, product:products(id, name), owner:users!owner_id(id, email, full_name), teams:project_teams(team:teams(*)), products:project_products(product:products(*), is_primary)')
      .eq('id', data.id)
      .single();

    await logActivity(userId, 'project_created', 'projects', data.id, {
      project_name: name,
      product_id
    });

    res.status(201).json({ success: true, data: fullProject || data });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { id } = req.params;
    const { 
      name, description, product_id, owner_id, status,
      start_date, target_end_date, actual_end_date,
      progress_percentage, roadmap_color, roadmap_visible, milestone_type
    } = req.body;

    // Check permissions
    if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update projects'
      });
    }

    // Validate status if provided - check against database
    if (status !== undefined) {
      const { data: validStatuses } = await supabaseAdmin
        .from('project_statuses')
        .select('slug');
      
      const validSlugs = validStatuses?.map(s => s.slug) || ['ongoing', 'on_hold', 'blocked', 'done', 'cancelled'];
      
      if (!validSlugs.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validSlugs.join(', ')}`
        });
      }
    }

    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (product_id !== undefined) updates.product_id = product_id;
    if (owner_id !== undefined) updates.owner_id = owner_id;
    if (status !== undefined) {
      updates.status = status;
      // Auto-deprioritize when marking as done or cancelled
      if (status === 'done' || status === 'cancelled') {
        updates.priority_order = 0;
      }
    }
    // Roadmap fields
    if (start_date !== undefined) updates.start_date = start_date || null;
    if (target_end_date !== undefined) updates.target_end_date = target_end_date || null;
    if (actual_end_date !== undefined) updates.actual_end_date = actual_end_date || null;
    if (progress_percentage !== undefined) updates.progress_percentage = progress_percentage;
    if (roadmap_color !== undefined) updates.roadmap_color = roadmap_color;
    if (roadmap_visible !== undefined) updates.roadmap_visible = roadmap_visible;
    if (milestone_type !== undefined) updates.milestone_type = milestone_type;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select('*, product:products(id, name), owner:users!owner_id(id, email, full_name), teams:project_teams(team:teams(*)), products:project_products(product:products(*), is_primary)')
      .single();

    if (error) throw error;

    await logActivity(userId, 'project_updated', 'projects', id, {
      project_name: name,
      product_id: product_id,
      owner_id: owner_id
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { id } = req.params;

    // Only Owner, Admin, Manager can delete projects
    if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete projects'
      });
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logActivity(userId, 'project_deleted', 'projects', id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateProjectPriorities = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { priorities } = req.body;

    // Only Owner, Admin, Manager can update project priorities
    if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update project priorities'
      });
    }

    // priorities should be an array of { id, priority_order }
    if (!Array.isArray(priorities)) {
      return res.status(400).json({
        success: false,
        error: 'priorities must be an array'
      });
    }

    // Update each project's priority_order
    const updatePromises = priorities.map(({ id, priority_order }) =>
      supabaseAdmin
        .from('projects')
        .update({ priority_order })
        .eq('id', id)
    );

    await Promise.all(updatePromises);

    await logActivity(userId, 'project_priorities_updated', 'projects', 'bulk', {
      count: priorities.length
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Project Labels
export const getProjectLabels = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('project_labels')
      .select('*, label:labels(*)')
      .eq('project_id', id);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

export const addProjectLabel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { label_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('project_labels')
      .insert({ project_id: id, label_id })
      .select('*, label:labels(*)')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const removeProjectLabel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id, label_id } = req.params;

    const { error } = await supabaseAdmin
      .from('project_labels')
      .delete()
      .eq('project_id', id)
      .eq('label_id', label_id);

    if (error) throw error;

    res.json({ success: true, message: 'Label removed successfully' });
  } catch (error) {
    next(error);
  }
};

// Project Teams
export const getProjectTeams = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('project_teams')
      .select('*, team:teams(*)')
      .eq('project_id', id);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

export const addProjectTeam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { team_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('project_teams')
      .insert({ project_id: id, team_id })
      .select('*, team:teams(*)')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const removeProjectTeam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id, team_id } = req.params;

    const { error } = await supabaseAdmin
      .from('project_teams')
      .delete()
      .eq('project_id', id)
      .eq('team_id', team_id);

    if (error) throw error;

    res.json({ success: true, message: 'Team removed successfully' });
  } catch (error) {
    next(error);
  }
};

// Project Products (multiple products per project)
export const getProjectProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('project_products')
      .select('*, product:products(*)')
      .eq('project_id', id);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

export const addProjectProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { product_id, is_primary = false } = req.body;

    const { data, error } = await supabaseAdmin
      .from('project_products')
      .insert({ project_id: id, product_id, is_primary })
      .select('*, product:products(*)')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const removeProjectProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id, product_id } = req.params;

    const { error } = await supabaseAdmin
      .from('project_products')
      .delete()
      .eq('project_id', id)
      .eq('product_id', product_id);

    if (error) throw error;

    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

