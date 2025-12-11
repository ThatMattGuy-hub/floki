import { Request } from 'express';

export enum UserRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  CONTRIBUTOR = 'Contributor',
  EXTERNAL_AGENCY = 'External Agency',
  VIEWER = 'Viewer'
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  USER = 'user',
  TEAM = 'team',
  URL = 'url',
  CURRENCY = 'currency',
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
  JSON = 'json'
}

export enum AutomationTrigger {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  STATUS_CHANGED = 'status_changed',
  DUE_SOON = 'due_soon',
  SLA_BREACH = 'sla_breach',
  FIELD_CHANGED = 'field_changed',
  ASSIGNMENT_CHANGED = 'assignment_changed',
  MENTION_ADDED = 'mention_added',
  APPROVAL_COMPLETED = 'approval_completed'
}

export enum AutomationAction {
  CHANGE_STATUS = 'change_status',
  CHANGE_ASSIGNEE = 'change_assignee',
  ADD_LABEL = 'add_label',
  ADD_WATCHER = 'add_watcher',
  CREATE_SUBTASK = 'create_subtask',
  SEND_EMAIL = 'send_email',
  TRIGGER_APPROVAL = 'trigger_approval',
  LOG_AUDIT = 'log_audit'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum NotificationType {
  ASSIGNMENT = 'assignment',
  MENTION = 'mention',
  STATUS_CHANGE = 'status_change',
  SLA_ALERT = 'sla_alert',
  APPROVAL = 'approval',
  COMMENT = 'comment',
  AUTOMATION = 'automation',
  WATCHER = 'watcher'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
}

export interface Agency {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  agency_id?: string;
  is_agency_team: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  owner_id?: string;
  start_date?: string;
  end_date?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  product_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  status_id?: string;
  priority: number;
  due_date?: string;
  sla_deadline?: string;
  estimated_hours?: number;
  actual_hours?: number;
  is_archived: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Report Types
export enum ReportDataSource {
  TASKS = 'tasks',
  PROJECTS = 'projects',
  PRODUCTS = 'products',
  AGENCIES = 'agencies',
  USERS = 'users',
  AUDIT_LOGS = 'audit_logs'
}

export enum VisualizationType {
  TABLE = 'table',
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  STACKED_BAR = 'stacked_bar',
  KPI = 'kpi'
}

export enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max'
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
}

export interface ReportQueryConfig {
  filters?: ReportFilter[];
  groupBy?: string[];
  aggregations?: {
    field: string;
    type: AggregationType;
    alias?: string;
  }[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
}

export interface VisualizationConfig {
  xAxis?: string;
  yAxis?: string[];
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
}

export interface ReportQuery {
  id: string;
  report_id: string;
  data_source: ReportDataSource;
  query_config: ReportQueryConfig;
  visualization_type?: VisualizationType;
  visualization_config?: VisualizationConfig;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  config?: any; // Legacy config format
  is_template: boolean;
  is_shared: boolean;
  shared_with_roles?: string[];
  shared_with_teams?: string[];
  created_at: string;
  updated_at: string;
  queries?: ReportQuery[];
}

export interface ReportShare {
  id: string;
  report_id: string;
  shared_with_type: 'user' | 'team' | 'agency' | 'public';
  shared_with_id?: string;
  can_edit: boolean;
  created_at: string;
}

export interface ReportSchedule {
  id: string;
  report_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_config: any;
  recipients: string[];
  format: 'csv' | 'xlsx' | 'pdf';
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

