import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { canUserSeeTask } from '../utils/visibility';
import logger from '../config/logger';

export const getSubtasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Get parent task to inherit project_id and product_id
  const { data: parentTask } = await supabaseAdmin
    .from('tasks')
    .select('project_id, product_id')
    .eq('id', task_id)
    .single();

  if (!parentTask) {
    throw new AppError('Parent task not found', 404);
  }

  // Fetch subtasks as full tasks
  const { data: subtasks, error } = await supabaseAdmin
    .from('tasks')
    .select(`
      *,
      project:projects(*),
      product:products(*),
      status:statuses(*),
      assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
      created_by_user:users!tasks_created_by_fkey(id, full_name, email, avatar_url),
      labels:task_labels(label:labels(*)),
      watchers:watchers(user:users(id, full_name, email, avatar_url)),
      agencies:task_agencies(agency:agencies(*)),
      teams:task_teams(team:teams(*))
    `)
    .eq('parent_task_id', task_id)
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('Failed to fetch subtasks:', error);
    throw new AppError('Failed to fetch subtasks', 500);
  }

  res.json({
    success: true,
    data: subtasks || []
  });
});

export const createSubtask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;
  const { 
    title, 
    description, 
    assignee_id,
    status_id,
    priority = 1,
    due_date,
    estimated_hours
  } = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Get parent task to inherit project_id and product_id
  const { data: parentTask, error: parentError } = await supabaseAdmin
    .from('tasks')
    .select('project_id, product_id')
    .eq('id', task_id)
    .single();

  if (parentError || !parentTask) {
    logger.error('Failed to fetch parent task:', parentError);
    throw new AppError('Parent task not found', 404);
  }

  // Create subtask as a full task
  const { data: subtask, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      parent_task_id: task_id,
      project_id: parentTask.project_id,
      product_id: parentTask.product_id,
      title,
      description,
      assignee_id,
      status_id,
      priority,
      due_date,
      estimated_hours,
      created_by: req.userId
    })
    .select(`
      *,
      project:projects(*),
      product:products(*),
      status:statuses(*),
      assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
      created_by_user:users!tasks_created_by_fkey(id, full_name, email, avatar_url),
      labels:task_labels(label:labels(*)),
      watchers:watchers(user:users(id, full_name, email, avatar_url)),
      agencies:task_agencies(agency:agencies(*)),
      teams:task_teams(team:teams(*))
    `)
    .single();

  if (error || !subtask) {
    logger.error('Failed to create subtask:', error);
    throw new AppError('Failed to create subtask', 500);
  }

  res.status(201).json({
    success: true,
    data: subtask,
    message: 'Subtask created successfully'
  });
});

export const updateSubtask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, subtask_id } = req.params;
  const updates = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Verify this is actually a subtask of the parent task
  const { data: subtaskCheck } = await supabaseAdmin
    .from('tasks')
    .select('id, parent_task_id')
    .eq('id', subtask_id)
    .eq('parent_task_id', task_id)
    .single();

  if (!subtaskCheck) {
    throw new AppError('Subtask not found or does not belong to this task', 404);
  }

  // Remove fields that shouldn't be updated directly
  delete updates.id;
  delete updates.parent_task_id;
  delete updates.project_id;
  delete updates.product_id;
  delete updates.created_by;
  delete updates.created_at;

  const { data: subtask, error } = await supabaseAdmin
    .from('tasks')
    .update(updates)
    .eq('id', subtask_id)
    .select(`
      *,
      project:projects(*),
      product:products(*),
      status:statuses(*),
      assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
      created_by_user:users!tasks_created_by_fkey(id, full_name, email, avatar_url),
      labels:task_labels(label:labels(*)),
      watchers:watchers(user:users(id, full_name, email, avatar_url)),
      agencies:task_agencies(agency:agencies(*)),
      teams:task_teams(team:teams(*))
    `)
    .single();

  if (error || !subtask) {
    logger.error('Failed to update subtask:', error);
    throw new AppError('Failed to update subtask', 500);
  }

  res.json({
    success: true,
    data: subtask,
    message: 'Subtask updated successfully'
  });
});

export const deleteSubtask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, subtask_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Verify this is actually a subtask of the parent task
  const { data: subtaskCheck } = await supabaseAdmin
    .from('tasks')
    .select('id')
    .eq('id', subtask_id)
    .eq('parent_task_id', task_id)
    .single();

  if (!subtaskCheck) {
    throw new AppError('Subtask not found or does not belong to this task', 404);
  }

  // Delete the subtask (cascade will handle related records)
  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', subtask_id);

  if (error) {
    logger.error('Failed to delete subtask:', error);
    throw new AppError('Failed to delete subtask', 500);
  }

  res.json({
    success: true,
    message: 'Subtask deleted successfully'
  });
});

export const getChecklistItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  const { data: items, error } = await supabaseAdmin
    .from('checklist_items')
    .select('*')
    .eq('task_id', task_id)
    .order('order_index', { ascending: true });

  if (error) {
    logger.error('Failed to fetch checklist items:', error);
    throw new AppError('Failed to fetch checklist items', 500);
  }

  res.json({
    success: true,
    data: items
  });
});

export const createChecklistItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;
  const { title } = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Get the next order index
  const { data: lastItem } = await supabaseAdmin
    .from('checklist_items')
    .select('order_index')
    .eq('task_id', task_id)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const order_index = (lastItem?.order_index || 0) + 1;

  const { data: item, error } = await supabaseAdmin
    .from('checklist_items')
    .insert({
      task_id,
      title,
      order_index
    })
    .select()
    .single();

  if (error || !item) {
    logger.error('Failed to create checklist item:', error);
    throw new AppError('Failed to create checklist item', 500);
  }

  res.status(201).json({
    success: true,
    data: item,
    message: 'Checklist item created successfully'
  });
});

export const updateChecklistItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, item_id } = req.params;
  const updates = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Handle completion (frontend sends is_checked, database uses is_completed)
  if (updates.is_checked !== undefined) {
    updates.is_completed = updates.is_checked;
    delete updates.is_checked;
    
    if (updates.is_completed) {
      updates.completed_at = new Date().toISOString();
      updates.completed_by = req.userId;
    } else {
      updates.completed_at = null;
      updates.completed_by = null;
    }
  }

  delete updates.id;
  delete updates.task_id;

  const { data: item, error } = await supabaseAdmin
    .from('checklist_items')
    .update(updates)
    .eq('id', item_id)
    .eq('task_id', task_id)
    .select()
    .single();

  if (error || !item) {
    logger.error('Failed to update checklist item:', error);
    throw new AppError('Failed to update checklist item', 500);
  }

  res.json({
    success: true,
    data: item,
    message: 'Checklist item updated successfully'
  });
});

export const deleteChecklistItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, item_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  const { error } = await supabaseAdmin
    .from('checklist_items')
    .delete()
    .eq('id', item_id)
    .eq('task_id', task_id);

  if (error) {
    logger.error('Failed to delete checklist item:', error);
    throw new AppError('Failed to delete checklist item', 500);
  }

  res.json({
    success: true,
    message: 'Checklist item deleted successfully'
  });
});

export const reorderChecklistItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;
  const { priorities } = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  if (!Array.isArray(priorities) || priorities.length === 0) {
    throw new AppError('Priorities array is required', 400);
  }

  // Update each checklist item's order_index
  for (const item of priorities) {
    const { error } = await supabaseAdmin
      .from('checklist_items')
      .update({ order_index: item.order_index })
      .eq('id', item.id)
      .eq('task_id', task_id);

    if (error) {
      logger.error('Failed to update checklist item order:', error);
      throw new AppError('Failed to reorder checklist items', 500);
    }
  }

  res.json({
    success: true,
    message: 'Checklist items reordered successfully'
  });
});

export const getWatchers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  const { data: watchers, error } = await supabaseAdmin
    .from('watchers')
    .select(`
      id,
      user:users(id, full_name, email, avatar_url),
      created_at
    `)
    .eq('task_id', task_id);

  if (error) {
    logger.error('Failed to fetch watchers:', error);
    throw new AppError('Failed to fetch watchers', 500);
  }

  res.json({
    success: true,
    data: watchers
  });
});

export const addWatcher = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;
  const { user_id } = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Check if already watching
  const { data: existing } = await supabaseAdmin
    .from('watchers')
    .select('id')
    .eq('task_id', task_id)
    .eq('user_id', user_id)
    .single();

  if (existing) {
    return res.json({
      success: true,
      message: 'User is already watching this task'
    });
  }

  const { data: watcher, error } = await supabaseAdmin
    .from('watchers')
    .insert({
      task_id,
      user_id
    })
    .select(`
      id,
      user:users(id, full_name, email, avatar_url),
      created_at
    `)
    .single();

  if (error || !watcher) {
    logger.error('Failed to add watcher:', error);
    throw new AppError('Failed to add watcher', 500);
  }

  // Send notification to the user being added as watcher (async, don't block)
  import('../services/notificationService').then(({ notifyWatcherAdded }) => {
    notifyWatcherAdded(task_id, user_id, req.userId!).catch(err =>
      logger.error('Failed to send watcher notification:', err)
    );
  });

  res.status(201).json({
    success: true,
    data: watcher,
    message: 'Watcher added successfully'
  });
});

export const removeWatcher = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, user_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Users can only remove themselves unless they're admin/manager
  if (user_id !== req.userId && ![UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER].includes(req.user!.role)) {
    throw new AppError('Cannot remove other users as watchers', 403);
  }

  const { error } = await supabaseAdmin
    .from('watchers')
    .delete()
    .eq('task_id', task_id)
    .eq('user_id', user_id);

  if (error) {
    logger.error('Failed to remove watcher:', error);
    throw new AppError('Failed to remove watcher', 500);
  }

  res.json({
    success: true,
    message: 'Watcher removed successfully'
  });
});

// Task Labels
export const getTaskLabels = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('task_labels')
    .select('*, label:labels(*)')
    .eq('task_id', task_id);

  if (error) {
    logger.error('Failed to get task labels:', error);
    throw new AppError('Failed to get task labels', 500);
  }

  res.json({
    success: true,
    data: data || []
  });
});

export const addTaskLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;
  const { label_id } = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('task_labels')
    .insert({ task_id, label_id })
    .select('*, label:labels(*)')
    .single();

  if (error) {
    logger.error('Failed to add label:', error);
    throw new AppError('Failed to add label', 500);
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Label added successfully'
  });
});

export const removeTaskLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, label_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, task_id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  const { error } = await supabaseAdmin
    .from('task_labels')
    .delete()
    .eq('task_id', task_id)
    .eq('label_id', label_id);

  if (error) {
    logger.error('Failed to remove label:', error);
    throw new AppError('Failed to remove label', 500);
  }

  res.json({
    success: true,
    message: 'Label removed successfully'
  });
});

