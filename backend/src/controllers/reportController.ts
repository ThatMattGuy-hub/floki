import { Response } from 'express';
import { AuthenticatedRequest, UserRole, Report, ReportQuery, ReportDataSource, VisualizationType } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/audit';
import logger from '../config/logger';
import { getVisibleTasksForExternalAgency, getVisibleProjectsForExternalAgency, getVisibleProductsForExternalAgency } from '../utils/visibility';

// Get all reports accessible to the user
export const getReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;

  let query = supabaseAdmin
    .from('reports')
    .select(`
      *,
      creator:users!reports_created_by_fkey(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  // External Agency users can only see shared reports or their own
  if (userRole === UserRole.EXTERNAL_AGENCY) {
    query = query.or(`created_by.eq.${userId},is_shared.eq.true`);
  }

  const { data: reports, error } = await query;

  if (error) {
    logger.error('Failed to fetch reports:', error);
    throw new AppError('Failed to fetch reports', 500);
  }

  // Filter reports based on sharing rules
  const filteredReports = (reports || []).filter((report: any) => {
    // Creator can always see their own reports
    if (report.created_by === userId) return true;

    // Check if report is shared with user's role
    if (report.is_shared && report.shared_with_roles) {
      if (report.shared_with_roles.includes(userRole)) return true;
    }

    // Check if report is shared with user's teams
    // TODO: Implement team-based sharing check

    return false;
  });

  res.json({
    success: true,
    data: filteredReports
  });
});

// Get report by ID
export const getReportById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const userRole = req.user!.role;

  const { data: report, error } = await supabaseAdmin
    .from('reports')
    .select(`
      *,
      creator:users!reports_created_by_fkey(id, full_name, email),
      queries:report_queries(*)
    `)
    .eq('id', id)
    .single();

  if (error || !report) {
    throw new AppError('Report not found', 404);
  }

  // Check access permissions
  if (report.created_by !== userId) {
    if (!report.is_shared) {
      throw new AppError('Access denied', 403);
    }
    if (report.shared_with_roles && !report.shared_with_roles.includes(userRole)) {
      throw new AppError('Access denied', 403);
    }
  }

  res.json({
    success: true,
    data: report
  });
});

// Create a new report
export const createReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userRole = req.user!.role;

  // Check permissions
  if (!['Owner', 'Admin', 'Manager', 'Contributor'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to create reports'
    });
  }

  const { name, description, is_template, queries } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Report name is required'
    });
  }

  // Create report
  const { data: report, error: reportError } = await supabaseAdmin
    .from('reports')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      created_by: userId,
      is_template: is_template || false,
      is_shared: false,
      config: null // Legacy field, we use report_queries table now
    })
    .select()
    .single();

  if (reportError || !report) {
    logger.error('Failed to create report:', reportError);
    throw new AppError('Failed to create report', 500);
  }

  // Create report queries if provided
  if (queries && Array.isArray(queries) && queries.length > 0) {
    const queryInserts = queries.map((q: any, index: number) => ({
      report_id: report.id,
      data_source: q.data_source,
      query_config: q.query_config || {},
      visualization_type: q.visualization_type || null,
      visualization_config: q.visualization_config || null,
      sort_order: index
    }));

    const { error: queriesError } = await supabaseAdmin
      .from('report_queries')
      .insert(queryInserts);

    if (queriesError) {
      logger.error('Failed to create report queries:', queriesError);
      // Don't fail the whole request, just log the error
    }
  }

  await logActivity(userId, 'report_created', 'reports', report.id, {
    report_name: name
  });

  res.status(201).json({
    success: true,
    data: report
  });
});

// Update report
export const updateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const userRole = req.user!.role;

  // Check if report exists and user has permission
  const { data: existingReport } = await supabaseAdmin
    .from('reports')
    .select('created_by, is_shared, shared_with_roles')
    .eq('id', id)
    .single();

  if (!existingReport) {
    throw new AppError('Report not found', 404);
  }

  // Check edit permissions
  const canEdit = existingReport.created_by === userId || 
    (existingReport.is_shared && existingReport.shared_with_roles?.includes(userRole));

  if (!canEdit && !['Owner', 'Admin', 'Manager'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to edit this report'
    });
  }

  const { name, description, is_template, is_shared, shared_with_roles, shared_with_teams, queries } = req.body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (is_template !== undefined) updateData.is_template = is_template;
  if (is_shared !== undefined) updateData.is_shared = is_shared;
  if (shared_with_roles !== undefined) updateData.shared_with_roles = shared_with_roles;
  if (shared_with_teams !== undefined) updateData.shared_with_teams = shared_with_teams;

  const { data: report, error } = await supabaseAdmin
    .from('reports')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !report) {
    logger.error('Failed to update report:', error);
    throw new AppError('Failed to update report', 500);
  }

  // Update queries if provided
  if (queries && Array.isArray(queries)) {
    // Delete existing queries
    await supabaseAdmin
      .from('report_queries')
      .delete()
      .eq('report_id', id);

    // Insert new queries
    if (queries.length > 0) {
      const queryInserts = queries.map((q: any, index: number) => ({
        report_id: id,
        data_source: q.data_source,
        query_config: q.query_config || {},
        visualization_type: q.visualization_type || null,
        visualization_config: q.visualization_config || null,
        sort_order: index
      }));

      await supabaseAdmin
        .from('report_queries')
        .insert(queryInserts);
    }
  }

  await logActivity(userId, 'report_updated', 'reports', id, {
    report_name: report.name
  });

  res.json({
    success: true,
    data: report
  });
});

// Delete report
export const deleteReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const userRole = req.user!.role;

  // Check if report exists and user has permission
  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('created_by')
    .eq('id', id)
    .single();

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Only creator or admin/owner can delete
  if (report.created_by !== userId && !['Owner', 'Admin'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to delete this report'
    });
  }

  const { error } = await supabaseAdmin
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Failed to delete report:', error);
    throw new AppError('Failed to delete report', 500);
  }

  await logActivity(userId, 'report_deleted', 'reports', id);

  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
});

// Execute report query
export const executeReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const userRole = req.user!.role;

  // Get report
  const { data: report, error: reportError } = await supabaseAdmin
    .from('reports')
    .select(`
      *,
      queries:report_queries(*)
    `)
    .eq('id', id)
    .single();

  if (reportError || !report) {
    throw new AppError('Report not found', 404);
  }

  // Check access permissions
  if (report.created_by !== userId) {
    if (!report.is_shared) {
      throw new AppError('Access denied', 403);
    }
    if (report.shared_with_roles && !report.shared_with_roles.includes(userRole)) {
      throw new AppError('Access denied', 403);
    }
  }

  // Execute queries
  const results = await Promise.all(
    (report.queries || []).map(async (query: any) => {
      try {
        const data = await executeQuery(query, userId, userRole);
        return {
          query_id: query.id,
          data_source: query.data_source,
          visualization_type: query.visualization_type,
          visualization_config: query.visualization_config,
          data
        };
      } catch (error: any) {
        logger.error(`Failed to execute query ${query.id}:`, error);
        return {
          query_id: query.id,
          error: error.message || 'Query execution failed'
        };
      }
    })
  );

  res.json({
    success: true,
    data: {
      report_id: id,
      report_name: report.name,
      results
    }
  });
});

// Execute a single query with RBAC filters
async function executeQuery(query: any, userId: string, userRole: string): Promise<any> {
  const { data_source, query_config } = query;

  // Apply RBAC filters based on user role
  let baseQuery = supabaseAdmin.from(data_source).select('*');

  // Apply visibility filters for External Agency users
  if (userRole === UserRole.EXTERNAL_AGENCY) {
    if (data_source === 'tasks') {
      const visibleTaskIds = await getVisibleTasksForExternalAgency(userId);
      if (visibleTaskIds.length === 0) {
        return [];
      }
      baseQuery = baseQuery.in('id', visibleTaskIds);
    } else if (data_source === 'projects') {
      const visibleProjectIds = await getVisibleProjectsForExternalAgency(userId);
      if (visibleProjectIds.length === 0) {
        return [];
      }
      baseQuery = baseQuery.in('id', visibleProjectIds);
    } else if (data_source === 'products') {
      const visibleProductIds = await getVisibleProductsForExternalAgency(userId);
      if (visibleProductIds.length === 0) {
        return [];
      }
      baseQuery = baseQuery.in('id', visibleProductIds);
    }
  }

  // Apply query filters
  if (query_config?.filters) {
    for (const filter of query_config.filters) {
      switch (filter.operator) {
        case 'equals':
          baseQuery = baseQuery.eq(filter.field, filter.value);
          break;
        case 'not_equals':
          baseQuery = baseQuery.neq(filter.field, filter.value);
          break;
        case 'contains':
          baseQuery = baseQuery.ilike(filter.field, `%${filter.value}%`);
          break;
        case 'greater_than':
          baseQuery = baseQuery.gt(filter.field, filter.value);
          break;
        case 'less_than':
          baseQuery = baseQuery.lt(filter.field, filter.value);
          break;
        case 'in':
          baseQuery = baseQuery.in(filter.field, filter.value);
          break;
      }
    }
  }

  // Apply ordering
  if (query_config?.orderBy && query_config.orderBy.length > 0) {
    for (const order of query_config.orderBy) {
      baseQuery = baseQuery.order(order.field, { ascending: order.direction === 'asc' });
    }
  }

  // Apply limit
  if (query_config?.limit) {
    baseQuery = baseQuery.limit(query_config.limit);
  }

  const { data, error } = await baseQuery;

  if (error) {
    throw new Error(`Query execution failed: ${error.message}`);
  }

  // Apply aggregations if specified
  if (query_config?.aggregations && data) {
    // Simple aggregation logic (can be enhanced)
    const aggregated = query_config.aggregations.map(agg => {
      const values = data.map((row: any) => row[agg.field]).filter((v: any) => v != null);
      let result: number = 0;

      switch (agg.type) {
        case 'sum':
          result = values.reduce((a: number, b: number) => a + b, 0);
          break;
        case 'avg':
          result = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
          break;
        case 'count':
          result = values.length;
          break;
        case 'min':
          result = Math.min(...values);
          break;
        case 'max':
          result = Math.max(...values);
          break;
      }

      return {
        field: agg.field,
        type: agg.type,
        alias: agg.alias || `${agg.type}_${agg.field}`,
        value: result
      };
    });

    return {
      raw_data: data,
      aggregations: aggregated
    };
  }

  return data || [];
}
