import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { canUserSeeTask, getVisibleTasksForExternalAgency, filterInternalComments } from '../utils/visibility';
import logger from '../config/logger';

export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    project_id, 
    product_id, 
    status_id, 
    assignee_id,
    agency_id,
    team_id,
    priority,
    due_date_from,
    due_date_to,
    created_from,
    created_to,
    sort_by = 'created_at',
    sort_order = 'desc',
    page = 1, 
    limit = 50 
  } = req.query;
  
  logger.info('getTasks called', { 
    query: req.query, 
    user: req.user?.id, 
    role: req.user?.role 
  });
  
  let query = supabaseAdmin
    .from('tasks')
    .select(`
      *,
      project:projects(*),
      product:products(*),
      status:statuses(*),
      assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
      created_by_user:users!tasks_created_by_fkey(id, full_name, email, avatar_url),
      labels:task_labels(label:labels(*)),
      agencies:task_agencies(agency:agencies(*)),
      teams:task_teams(team:teams(*))
    `, { count: 'exact' });

  // Exclude subtasks from main task list (only show top-level tasks)
  query = query.is('parent_task_id', null);

  // Apply filters
  if (project_id) query = query.eq('project_id', project_id as string);
  if (product_id) query = query.eq('product_id', product_id as string);
  if (status_id) query = query.eq('status_id', status_id as string);
  if (assignee_id) query = query.eq('assignee_id', assignee_id as string);
  if (priority !== undefined) query = query.eq('priority', parseInt(priority as string));
  if (due_date_from) query = query.gte('due_date', due_date_from as string);
  if (due_date_to) query = query.lte('due_date', due_date_to as string);
  if (created_from) query = query.gte('created_at', created_from as string);
  if (created_to) query = query.lte('created_at', created_to as string);
  
  // Filter by agency_id and/or team_id (tasks that have these assigned)
  let filteredTaskIds: string[] | null = null;
  
  if (agency_id || team_id) {
    const taskIdSets: Set<string>[] = [];
    
    // Get tasks with the specified agency
    if (agency_id) {
      const { data: agencyTasks } = await supabaseAdmin
        .from('task_agencies')
        .select('task_id')
        .eq('agency_id', agency_id as string);
      
      if (agencyTasks && agencyTasks.length > 0) {
        taskIdSets.push(new Set(agencyTasks.map((at: any) => at.task_id)));
      } else {
        // No tasks found for this agency, return empty result
        filteredTaskIds = [];
      }
    }
    
    // Get tasks with the specified team
    if (team_id && filteredTaskIds === null) {
      const { data: teamTasks } = await supabaseAdmin
        .from('task_teams')
        .select('task_id')
        .eq('team_id', team_id as string);
      
      if (teamTasks && teamTasks.length > 0) {
        taskIdSets.push(new Set(teamTasks.map((tt: any) => tt.task_id)));
      } else {
        // No tasks found for this team, return empty result
        filteredTaskIds = [];
      }
    }
    
    // If we have multiple filters, intersect the sets
    if (filteredTaskIds === null && taskIdSets.length > 0) {
      if (taskIdSets.length === 1) {
        filteredTaskIds = Array.from(taskIdSets[0]);
      } else {
        // Intersect all sets - start with the first set and filter by subsequent sets
        const intersection = taskIdSets.reduce((acc, set) => {
          return new Set([...acc].filter(id => set.has(id)));
        }, taskIdSets[0]);
        filteredTaskIds = Array.from(intersection);
      }
    }
    
    // Apply the filter to the query
    if (filteredTaskIds !== null) {
      if (filteredTaskIds.length > 0) {
        query = query.in('id', filteredTaskIds);
      } else {
        // No matching tasks, return empty result
        query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      }
    }
  }

  // External agency visibility filter
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const visibleTaskIds = await getVisibleTasksForExternalAgency(req.userId!);
    query = query.in('id', visibleTaskIds);
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  // Sorting
  const sortField = sort_by as string;
  const ascending = sort_order === 'asc';
  const validSortFields = ['created_at', 'updated_at', 'due_date', 'priority', 'priority_order', 'title'];
  const finalSortField = validSortFields.includes(sortField) ? sortField : 'created_at';
  
  // For priority_order, ensure NULLs sort last (new items appear at bottom)
  if (finalSortField === 'priority_order') {
    query = query.range(from, to).order(finalSortField, { ascending, nullsFirst: false });
  } else {
    query = query.range(from, to).order(finalSortField, { ascending });
  }

  const { data, error, count } = await query;

  if (error) {
    logger.error('Failed to fetch tasks:', { error, details: error.message, hint: error.hint });
    throw new AppError(`Failed to fetch tasks: ${error.message}`, 500);
  }
  
  logger.info('Tasks fetched successfully', { count: data?.length, total: count });

  res.json({
    success: true,
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum)
    }
  });
});

export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check visibility for external agency users
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // First get the main task
  const { data: task, error } = await supabaseAdmin
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
      checklist_items:checklist_items(*),
      agencies:task_agencies(agency:agencies(*)),
      teams:task_teams(team:teams(*))
    `)
    .eq('id', id)
    .single();

  if (error || !task) {
    logger.error('Failed to fetch task:', error);
    throw new AppError('Task not found', 404);
  }

  // Get parent task if this is a subtask
  if (task.parent_task_id) {
    const { data: parentTask } = await supabaseAdmin
      .from('tasks')
      .select('id, title')
      .eq('id', task.parent_task_id)
      .single();
    
    if (parentTask) {
      (task as any).parent_task = parentTask;
    }
  }

  // Get subtasks (tasks that have this task as parent)
  const { data: subtasks } = await supabaseAdmin
    .from('tasks')
    .select(`
      *,
      project:projects(*),
      product:products(*),
      status:statuses(*),
      assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
      agencies:task_agencies(agency:agencies(*)),
      teams:task_teams(team:teams(*))
    `)
    .eq('parent_task_id', id)
    .order('created_at', { ascending: true });
  
  if (subtasks) {
    (task as any).subtasks = subtasks;
  }

  res.json({
    success: true,
    data: task
  });
});

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    project_id,
    title,
    description,
    assignee_id,
    status_id,
    priority = 0,
    due_date,
    estimated_hours,
    labels = [],
    agencies = [],
    teams = [],
    watchers = []
  } = req.body;

  // Verify project exists and get its product_id
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id, product_id')
    .eq('id', project_id)
    .single();

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Derive product_id from project (tasks inherit product from their project)
  const product_id = project.product_id;

  // Get default status if not provided
  let finalStatusId = status_id;
  if (!finalStatusId) {
    const { data: defaultStatus } = await supabaseAdmin
      .from('statuses')
      .select('id')
      .eq('is_default', true)
      .limit(1)
      .single();
    
    if (defaultStatus) {
      finalStatusId = defaultStatus.id;
    }
  }

  // Create task
  const { data: task, error: taskError } = await supabaseAdmin
    .from('tasks')
    .insert({
      project_id,
      product_id,
      title,
      description,
      assignee_id,
      status_id: finalStatusId,
      priority,
      due_date,
      estimated_hours,
      created_by: req.userId
    })
    .select()
    .single();

  if (taskError || !task) {
    logger.error('Failed to create task:', taskError);
    throw new AppError('Failed to create task', 500);
  }

  // Add labels
  if (labels.length > 0) {
    const labelInserts = labels.map((labelId: string) => ({
      task_id: task.id,
      label_id: labelId
    }));
    await supabaseAdmin.from('task_labels').insert(labelInserts);
  }

  // Add agencies
  if (agencies.length > 0) {
    const agencyInserts = agencies.map((agencyId: string) => ({
      task_id: task.id,
      agency_id: agencyId
    }));
    await supabaseAdmin.from('task_agencies').insert(agencyInserts);
  }

  // Add teams
  if (teams.length > 0) {
    // Check for duplicate team assignments
    const uniqueTeams = [...new Set(teams)];
    if (uniqueTeams.length !== teams.length) {
      throw new AppError('Duplicate teams in request', 400);
    }

    // Check if any teams already exist for this task
    const { data: existingTeams } = await supabaseAdmin
      .from('task_teams')
      .select('team_id')
      .eq('task_id', task.id)
      .in('team_id', uniqueTeams);

    if (existingTeams && existingTeams.length > 0) {
      const existingIds = existingTeams.map((et: any) => et.team_id);
      throw new AppError(`Teams already assigned: ${existingIds.join(', ')}`, 400);
    }

    const teamInserts = (uniqueTeams as string[]).map((teamId: string) => ({
      task_id: task.id,
      team_id: teamId
    }));
    
    const { error: teamError } = await supabaseAdmin.from('task_teams').insert(teamInserts);
    if (teamError) {
      logger.error('Failed to add teams to task:', teamError);
      // Check for unique constraint violation
      if (teamError.code === '23505') {
        throw new AppError('One or more teams are already assigned to this task', 400);
      }
      throw new AppError(`Failed to add teams: ${teamError.message}`, 500);
    }
  }

  // Add watchers (including creator)
  const watcherSet = new Set([req.userId!, ...watchers]);
  if (assignee_id) watcherSet.add(assignee_id);
  
  const watcherInserts = Array.from(watcherSet).map(userId => ({
    task_id: task.id,
    user_id: userId
  }));
  await supabaseAdmin.from('watchers').insert(watcherInserts);

  res.status(201).json({
    success: true,
    data: task,
    message: 'Task created successfully'
  });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { agencies, teams, ...updates } = req.body;

  // Check visibility for external agency users
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Get existing task to detect changes for notifications
  const { data: existingTask } = await supabaseAdmin
    .from('tasks')
    .select('assignee_id, status_id')
    .eq('id', id)
    .single();

  const oldAssigneeId = existingTask?.assignee_id;
  const oldStatusId = existingTask?.status_id;

  // Remove fields that shouldn't be updated directly
  delete updates.id;
  delete updates.created_at;
  delete updates.created_by;

  // Only update task if there are actual fields to update
  let task;
  if (Object.keys(updates).length > 0) {
    const { data: updatedTask, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update task:', error);
      throw new AppError('Failed to update task', 500);
    }

    if (!updatedTask) {
      throw new AppError('Task not found', 404);
    }

    task = updatedTask;
  } else {
    // If no task fields to update, fetch the existing task
    const { data: existingTask, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !existingTask) {
      logger.error('Failed to fetch task:', error);
      throw new AppError('Task not found', 404);
    }

    task = existingTask;
  }

  // Update agencies if provided
  if (agencies !== undefined) {
    // Delete existing agency associations
    await supabaseAdmin
      .from('task_agencies')
      .delete()
      .eq('task_id', id);

    // Add new agency associations
    if (Array.isArray(agencies) && agencies.length > 0) {
      const agencyInserts = agencies.map((agencyId: string) => ({
        task_id: id,
        agency_id: agencyId
      }));
      await supabaseAdmin.from('task_agencies').insert(agencyInserts);
    }
  }

  // Update teams if provided
  if (teams !== undefined) {
    // Delete existing team associations
    await supabaseAdmin
      .from('task_teams')
      .delete()
      .eq('task_id', id);

    // Add new team associations
    if (Array.isArray(teams) && teams.length > 0) {
      // Remove duplicates
      const uniqueTeams = [...new Set(teams)];
      
      // Verify teams exist
      const { data: validTeams, error: verifyError } = await supabaseAdmin
        .from('teams')
        .select('id')
        .in('id', uniqueTeams);
      
      if (verifyError) {
        logger.error('Failed to verify teams:', verifyError);
        throw new AppError('Failed to verify teams', 500);
      }
      
      if (!validTeams || validTeams.length !== uniqueTeams.length) {
        throw new AppError('One or more team IDs are invalid', 400);
      }

      const teamInserts = (uniqueTeams as string[]).map((teamId: string) => ({
        task_id: id,
        team_id: teamId
      }));
      
      const { error: teamError } = await supabaseAdmin.from('task_teams').insert(teamInserts);
      if (teamError) {
        logger.error('Failed to add teams to task:', teamError);
        // Check for unique constraint violation
        if (teamError.code === '23505') {
          throw new AppError('One or more teams are already assigned to this task', 400);
        }
        throw new AppError(`Failed to add teams: ${teamError.message}`, 500);
      }
    }
  }

  // Fetch the complete task with all relationships
  const { data: completeTask, error: fetchError } = await supabaseAdmin
    .from('tasks')
    .select(`
      *,
      project:projects(*),
      product:products(*),
      status:statuses(*),
      assignee:users(id, email, full_name, avatar_url),
      labels:task_labels(label:labels(*)),
      watchers:watchers(user:users(id, email, full_name, avatar_url)),
      teams:task_teams(team:teams(*)),
      agencies:task_agencies(agency:agencies(*))
    `)
    .eq('id', id)
    .single();

  // Send notifications for changes (async, don't block response)
  const { notifyTaskAssignment, notifyStatusChange } = await import('../services/notificationService');
  
  // Notify if assignee changed
  const newAssigneeId = updates.assignee_id || task?.assignee_id;
  if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
    notifyTaskAssignment(id, newAssigneeId, req.userId!).catch(err => 
      logger.error('Failed to send assignment notification:', err)
    );
  }
  
  // Notify if status changed
  const newStatusId = updates.status_id || task?.status_id;
  if (newStatusId && newStatusId !== oldStatusId && oldStatusId) {
    notifyStatusChange(id, oldStatusId, newStatusId, req.userId!).catch(err =>
      logger.error('Failed to send status change notification:', err)
    );
  }

  if (fetchError || !completeTask) {
    logger.error('Failed to fetch updated task:', fetchError);
    // Return the task we have even if fetch fails
    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } else {
    res.json({
      success: true,
      data: completeTask,
      message: 'Task updated successfully'
    });
  }
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Only admins and managers can delete tasks
  if (![UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER].includes(req.user!.role)) {
    throw new AppError('Insufficient permissions to delete task', 403);
  }

  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Failed to delete task:', error);
    throw new AppError('Failed to delete task', 500);
  }

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

export const getTaskComments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  const { data: comments, error } = await supabaseAdmin
    .from('comments')
    .select(`
      *,
      user:users(id, full_name, email, avatar_url),
      mentions:comment_mentions(user:users(id, full_name, email))
    `)
    .eq('task_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('Failed to fetch comments:', error);
    throw new AppError('Failed to fetch comments', 500);
  }

  // Filter internal comments for external agency users
  const filteredComments = filterInternalComments(comments || [], req.user!.role);

  res.json({
    success: true,
    data: filteredComments
  });
});

export const addTaskComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { content, is_internal_only = false, mentions = [] } = req.body;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // External agency users cannot create internal comments
  const finalInternalFlag = req.user?.role === UserRole.EXTERNAL_AGENCY ? false : is_internal_only;

  const { data: comment, error } = await supabaseAdmin
    .from('comments')
    .insert({
      task_id: id,
      user_id: req.userId,
      content,
      is_internal_only: finalInternalFlag
    })
    .select()
    .single();

  if (error || !comment) {
    logger.error('Failed to create comment:', error);
    throw new AppError('Failed to create comment', 500);
  }

  // Add mentions and send notifications
  logger.info('Comment created, mentions received:', { mentions, mentionsLength: mentions.length });
  
  if (mentions.length > 0) {
    const mentionInserts = mentions.map((userId: string) => ({
      comment_id: comment.id,
      user_id: userId
    }));
    await supabaseAdmin.from('comment_mentions').insert(mentionInserts);
    
    // Send notifications to mentioned users
    logger.info('Sending mention notifications to users:', mentions);
    const { notifyMention } = await import('../services/notificationService');
    for (const userId of mentions) {
      logger.info('Calling notifyMention for user:', userId);
      await notifyMention(id, userId, content, req.userId!);
    }
  } else {
    logger.info('No mentions to process');
  }

  res.status(201).json({
    success: true,
    data: comment,
    message: 'Comment added successfully'
  });
});

export const deleteTaskComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id, comment_id } = req.params;

  // Check visibility
  if (req.user?.role === UserRole.EXTERNAL_AGENCY) {
    const canSee = await canUserSeeTask(req.userId!, id);
    if (!canSee) {
      throw new AppError('Task not found or access denied', 404);
    }
  }

  // Get comment to check ownership
  const { data: comment, error: fetchError } = await supabaseAdmin
    .from('comments')
    .select('user_id')
    .eq('id', comment_id)
    .eq('task_id', id)
    .single();

  if (fetchError || !comment) {
    throw new AppError('Comment not found', 404);
  }

  // Only allow deletion if user is comment owner or has admin/manager role
  const canDelete = comment.user_id === req.userId || 
    [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER].includes(req.user!.role);

  if (!canDelete) {
    throw new AppError('Insufficient permissions to delete comment', 403);
  }

  const { error } = await supabaseAdmin
    .from('comments')
    .delete()
    .eq('id', comment_id)
    .eq('task_id', id);

  if (error) {
    logger.error('Failed to delete comment:', error);
    throw new AppError('Failed to delete comment', 500);
  }

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

export const updateTaskPriorities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { priorities, project_id } = req.body;
  const userRole = req.user!.role;

  // Only Owner, Admin, Manager can update task priorities
  if (![UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER].includes(userRole)) {
    throw new AppError('Insufficient permissions to update task priorities', 403);
  }

  // priorities should be an array of { id, priority_order }
  if (!Array.isArray(priorities)) {
    throw new AppError('priorities must be an array', 400);
  }

  // Update each task's priority_order
  const updatePromises = priorities.map(({ id, priority_order }) =>
    supabaseAdmin
      .from('tasks')
      .update({ priority_order })
      .eq('id', id)
  );

  await Promise.all(updatePromises);

  logger.info('Task priorities updated', { 
    userId: req.userId, 
    count: priorities.length,
    projectId: project_id 
  });

  res.json({ success: true });
});

