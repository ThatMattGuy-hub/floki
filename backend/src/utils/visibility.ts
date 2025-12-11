import { supabaseAdmin } from '../config/supabase';
import { UserRole } from '../types';

/**
 * Check if a user can see a task based on External Agency visibility rules
 */
export async function canUserSeeTask(userId: string, taskId: string): Promise<boolean> {
  // Get user role
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (!user) return false;

  // Non-external agency users can see all tasks
  if (user.role !== UserRole.EXTERNAL_AGENCY) {
    return true;
  }

  // External agency users can see tasks if:
  // 1. Assigned to the task
  const { data: taskAssignment } = await supabaseAdmin
    .from('tasks')
    .select('assignee_id')
    .eq('id', taskId)
    .eq('assignee_id', userId)
    .single();

  if (taskAssignment) return true;

  // 2. Assigned to a subtask
  const { data: subtaskAssignment } = await supabaseAdmin
    .from('subtasks')
    .select('id')
    .eq('task_id', taskId)
    .eq('assignee_id', userId)
    .limit(1);

  if (subtaskAssignment && subtaskAssignment.length > 0) return true;

  // 3. Their agency is tagged on the task
  const { data: taskAgency } = await supabaseAdmin
    .from('task_agencies')
    .select(`
      agency_id,
      agencies!inner(
        teams!inner(
          team_members!inner(user_id)
        )
      )
    `)
    .eq('task_id', taskId)
    .eq('agencies.teams.team_members.user_id', userId)
    .limit(1);

  if (taskAgency && taskAgency.length > 0) return true;

  // 4. They are a watcher
  const { data: watcher } = await supabaseAdmin
    .from('watchers')
    .select('id')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .single();

  if (watcher) return true;

  // 5. They are mentioned in a comment
  const { data: mention } = await supabaseAdmin
    .from('comment_mentions')
    .select(`
      id,
      comments!inner(task_id)
    `)
    .eq('user_id', userId)
    .eq('comments.task_id', taskId)
    .limit(1);

  if (mention && mention.length > 0) return true;

  return false;
}

/**
 * Filter out internal-only custom fields for external agency users
 */
export function filterInternalFields(fields: any[], userRole: UserRole): any[] {
  if (userRole === UserRole.EXTERNAL_AGENCY) {
    return fields.filter(field => !field.is_internal_only);
  }
  return fields;
}

/**
 * Filter out internal-only comments for external agency users
 */
export function filterInternalComments(comments: any[], userRole: UserRole): any[] {
  if (userRole === UserRole.EXTERNAL_AGENCY) {
    return comments.filter(comment => !comment.is_internal_only);
  }
  return comments;
}

/**
 * Get tasks visible to external agency user
 */
export async function getVisibleTasksForExternalAgency(userId: string): Promise<string[]> {
  // Get all tasks where user is assigned
  const { data: assignedTasks } = await supabaseAdmin
    .from('tasks')
    .select('id')
    .eq('assignee_id', userId);

  // Get all tasks where user is assigned to a subtask
  const { data: subtaskTasks } = await supabaseAdmin
    .from('subtasks')
    .select('task_id')
    .eq('assignee_id', userId);

  // Get all tasks where user's agency is tagged
  const { data: agencyTasks } = await supabaseAdmin
    .from('task_agencies')
    .select(`
      task_id,
      agencies!inner(
        teams!inner(
          team_members!inner(user_id)
        )
      )
    `)
    .eq('agencies.teams.team_members.user_id', userId);

  // Get all tasks where user is a watcher
  const { data: watchedTasks } = await supabaseAdmin
    .from('watchers')
    .select('task_id')
    .eq('user_id', userId);

  // Get all tasks where user is mentioned
  const { data: mentionedTasks } = await supabaseAdmin
    .from('comment_mentions')
    .select(`
      comments!inner(task_id)
    `)
    .eq('user_id', userId);

  // Combine all task IDs
  const taskIds = new Set<string>();
  
  assignedTasks?.forEach(t => taskIds.add(t.id));
  subtaskTasks?.forEach(t => taskIds.add(t.task_id));
  agencyTasks?.forEach((t: any) => taskIds.add(t.task_id));
  watchedTasks?.forEach(t => taskIds.add(t.task_id));
  mentionedTasks?.forEach((t: any) => taskIds.add(t.comments.task_id));

  return Array.from(taskIds);
}

/**
 * Get projects visible to external agency user
 * Projects are visible if they contain tasks where:
 * - User is assigned to task/subtask
 * - User's agency is tagged on the task
 * - User is a watcher
 * - User is mentioned in a comment
 */
export async function getVisibleProjectsForExternalAgency(userId: string): Promise<string[]> {
  // Get all visible tasks first
  const visibleTaskIds = await getVisibleTasksForExternalAgency(userId);
  
  if (visibleTaskIds.length === 0) {
    return [];
  }

  // Get projects from visible tasks
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('project_id')
    .in('id', visibleTaskIds)
    .not('project_id', 'is', null);

  const projectIds = new Set<string>();
  tasks?.forEach(t => {
    if (t.project_id) projectIds.add(t.project_id);
  });

  return Array.from(projectIds);
}

/**
 * Get products visible to external agency user
 * Products are visible if they contain tasks where:
 * - User is assigned to task/subtask
 * - User's agency is tagged on the task
 * - User is a watcher
 * - User is mentioned in a comment
 */
export async function getVisibleProductsForExternalAgency(userId: string): Promise<string[]> {
  // Get all visible tasks first
  const visibleTaskIds = await getVisibleTasksForExternalAgency(userId);
  
  if (visibleTaskIds.length === 0) {
    return [];
  }

  // Get products from visible tasks
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('product_id')
    .in('id', visibleTaskIds)
    .not('product_id', 'is', null);

  const productIds = new Set<string>();
  tasks?.forEach(t => {
    if (t.product_id) productIds.add(t.product_id);
  });

  return Array.from(productIds);
}

