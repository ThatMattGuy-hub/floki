import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all Reports 2.0 for the user
export const getReports2 = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const { data, error } = await supabase
      .from('reports2')
      .select('*')
      .or(`created_by.eq.${userId},is_shared.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get reports2 error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single Report 2.0 by ID
export const getReport2ById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const { data, error } = await supabase
      .from('reports2')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Check access permissions
    if (data.created_by !== userId && !data.is_shared) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get report2 by ID error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new Report 2.0
export const createReport2 = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, description, widgets, defaultDateRange } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Report name is required' });
    }

    const { data, error } = await supabase
      .from('reports2')
      .insert({
        name,
        description,
        widgets: widgets || [],
        default_date_range: defaultDateRange,
        created_by: userId,
        is_shared: false
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Create report2 error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a Report 2.0
export const updateReport2 = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { name, description, widgets, defaultDateRange } = req.body;

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('reports2')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    if (existing.created_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('reports2')
      .update({
        name,
        description,
        widgets,
        default_date_range: defaultDateRange,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Update report2 error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a Report 2.0
export const deleteReport2 = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('reports2')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    if (existing.created_by !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { error } = await supabase
      .from('reports2')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete report2 error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Execute a widget query
export const runWidgetQuery = async (req: Request, res: Response) => {
  try {
    const widget = req.body;
    const { dataSourceId, dimensions, metrics, filters, sorts, limit } = widget;

    if (!dataSourceId) {
      return res.status(400).json({ success: false, error: 'Data source is required' });
    }

    // Build the query based on widget configuration
    let query: any = supabase.from(dataSourceId).select('*');

    // Apply filters
    if (filters && filters.length > 0) {
      filters.forEach((filter: any) => {
        const { fieldId, operator, value } = filter;
        const field = fieldId.split('.').pop(); // Extract field name from "tasks.status"

        switch (operator) {
          case 'equals':
            query = query.eq(field, value);
            break;
          case 'not_equals':
            query = query.neq(field, value);
            break;
          case 'greater_than':
            query = query.gt(field, value);
            break;
          case 'less_than':
            query = query.lt(field, value);
            break;
          case 'in':
            query = query.in(field, Array.isArray(value) ? value : [value]);
            break;
          case 'contains':
            query = query.ilike(field, `%${value}%`);
            break;
        }
      });
    }

    // Apply sorts
    if (sorts && sorts.length > 0) {
      sorts.forEach((sort: any) => {
        const field = sort.fieldId.split('.').pop();
        query = query.order(field, { ascending: sort.direction === 'asc' });
      });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data into WidgetResult format
    const result = transformToWidgetResult(data, dimensions, metrics);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Run widget query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to transform query results into WidgetResult format
function transformToWidgetResult(data: any[], dimensions: any[], metrics: any[]) {
  if (!data || data.length === 0) {
    return { columns: [], rows: [] };
  }

  // Build columns from dimensions and metrics
  const columns = [
    ...dimensions.map(d => ({
      id: d.fieldId,
      label: d.label || d.fieldId,
      type: 'string' as const
    })),
    ...metrics.map(m => ({
      id: m.fieldId,
      label: m.label || m.fieldId,
      type: 'number' as const
    }))
  ];

  // For simple queries without aggregation, just map the data
  if (metrics.length === 0 || metrics.every(m => m.aggregation === 'count')) {
    // Group by dimensions if specified
    if (dimensions.length > 0) {
      const grouped = groupAndAggregate(data, dimensions, metrics);
      const rows = grouped.map(group => [
        ...dimensions.map(d => {
          const field = d.fieldId.split('.').pop();
          return group[field];
        }),
        ...metrics.map(() => group.count)
      ]);
      return { columns, rows };
    }
  }

  // Simple row mapping for table view
  const rows = data.slice(0, 100).map(row => {
    return [
      ...dimensions.map(d => {
        const field = d.fieldId.split('.').pop();
        return row[field];
      }),
      ...metrics.map(m => {
        const field = m.fieldId.split('.').pop();
        return row[field] || 0;
      })
    ];
  });

  return { columns, rows };
}

// Helper to group and aggregate data
function groupAndAggregate(data: any[], dimensions: any[], metrics: any[]) {
  const groups: Record<string, any> = {};

  data.forEach(row => {
    const key = dimensions.map(d => {
      const field = d.fieldId.split('.').pop();
      return row[field];
    }).join('|');

    if (!groups[key]) {
      groups[key] = {
        count: 0,
        ...dimensions.reduce((acc, d) => {
          const field = d.fieldId.split('.').pop();
          acc[field] = row[field];
          return acc;
        }, {} as Record<string, any>)
      };
    }

    groups[key].count++;
  });

  return Object.values(groups);
}

// Get available fields for a data source
export const getDataSourceFields = async (req: Request, res: Response) => {
  try {
    const { dataSourceId } = req.params;

    // Return field metadata for the data source
    const fields = getFieldsForDataSource(dataSourceId);

    res.json({ success: true, data: fields });
  } catch (error: any) {
    console.error('Get data source fields error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper to define fields for each data source
function getFieldsForDataSource(dataSourceId: string) {
  const fieldDefinitions: Record<string, any[]> = {
    tasks: [
      { id: 'tasks.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'tasks.title', label: 'Title', type: 'string', isMetric: false },
      { id: 'tasks.status', label: 'Status', type: 'enum', isMetric: false },
      { id: 'tasks.priority', label: 'Priority', type: 'enum', isMetric: false },
      { id: 'tasks.due_date', label: 'Due Date', type: 'date', isMetric: false },
      { id: 'tasks.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'tasks.estimated_hours', label: 'Estimated Hours', type: 'number', isMetric: true },
      { id: 'tasks.actual_hours', label: 'Actual Hours', type: 'number', isMetric: true },
      { id: 'tasks.count', label: 'Task Count', type: 'number', isMetric: true }
    ],
    projects: [
      { id: 'projects.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'projects.name', label: 'Name', type: 'string', isMetric: false },
      { id: 'projects.start_date', label: 'Start Date', type: 'date', isMetric: false },
      { id: 'projects.end_date', label: 'End Date', type: 'date', isMetric: false },
      { id: 'projects.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'projects.count', label: 'Project Count', type: 'number', isMetric: true }
    ],
    products: [
      { id: 'products.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'products.name', label: 'Name', type: 'string', isMetric: false },
      { id: 'products.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'products.count', label: 'Product Count', type: 'number', isMetric: true }
    ],
    agencies: [
      { id: 'agencies.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'agencies.name', label: 'Name', type: 'string', isMetric: false },
      { id: 'agencies.is_active', label: 'Is Active', type: 'enum', isMetric: false },
      { id: 'agencies.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'agencies.count', label: 'Agency Count', type: 'number', isMetric: true }
    ],
    users: [
      { id: 'users.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'users.email', label: 'Email', type: 'string', isMetric: false },
      { id: 'users.full_name', label: 'Full Name', type: 'string', isMetric: false },
      { id: 'users.role', label: 'Role', type: 'enum', isMetric: false },
      { id: 'users.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'users.count', label: 'User Count', type: 'number', isMetric: true }
    ],
    audit_logs: [
      { id: 'audit_logs.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'audit_logs.action', label: 'Action', type: 'string', isMetric: false },
      { id: 'audit_logs.entity_type', label: 'Entity Type', type: 'string', isMetric: false },
      { id: 'audit_logs.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'audit_logs.count', label: 'Event Count', type: 'number', isMetric: true }
    ]
  };

  return fieldDefinitions[dataSourceId] || [];
}
