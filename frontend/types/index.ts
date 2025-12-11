export enum UserRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  CONTRIBUTOR = 'Contributor',
  EXTERNAL_AGENCY = 'External Agency',
  VIEWER = 'Viewer'
}

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Agency {
  id: string
  name: string
  description?: string
  contact_email?: string
  is_active: boolean
}

export interface Team {
  id: string
  name: string
  description?: string
  agency_id?: string
  is_agency_team: boolean
}

export interface Product {
  id: string
  name: string
  description?: string
  owner_id?: string
  is_archived: boolean
}

export interface Project {
  id: string
  product_id: string
  name: string
  description?: string
  owner_id?: string
  start_date?: string
  end_date?: string
  is_archived: boolean
}

export interface Status {
  id: string
  name: string
  color: string
  order_index: number
  is_default: boolean
  is_closed: boolean
}

export interface Label {
  id: string
  name: string
  color: string
  description?: string
}

export interface Task {
  id: string
  project_id: string
  product_id: string
  title: string
  description?: string
  assignee_id?: string
  status_id?: string
  priority: number
  due_date?: string
  sla_deadline?: string
  estimated_hours?: number
  actual_hours?: number
  is_archived: boolean
  created_by?: string
  created_at: string
  updated_at: string
  project?: Project
  product?: Product
  status?: Status
  assignee?: User
  labels?: { label: Label }[]
  watchers?: { user: User }[]
  subtasks?: Task[] // Subtasks are now full tasks
  checklist_items?: ChecklistItem[]
  agencies?: { agency: Agency }[]
  teams?: { team: Team }[]
  parent_task_id?: string
}

export interface ChecklistItem {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  completed_at?: string
  completed_by?: string
  order_index: number
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  is_internal_only: boolean
  created_at: string
  updated_at: string
  user?: User
  mentions?: { user: User }[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  role?: UserRole
}

