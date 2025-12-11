// Reports 2.0 Types - Looker Studio-style reporting

export type ReportWidgetType = 'table' | 'bar' | 'line' | 'pie' | 'scorecard'

export type DimensionConfig = {
  fieldId: string // e.g. "tasks.status"
  label?: string
  dateGranularity?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

export type MetricAggregation = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'count_distinct'

export type MetricConfig = {
  fieldId: string // e.g. "tasks.estimated_hours"
  label?: string
  aggregation: MetricAggregation
  format?: 'number' | 'percent' | 'currency' | 'duration'
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'between'
  | 'contains'
  | 'not_contains'

export type FilterConfig = {
  fieldId: string
  operator: FilterOperator
  value: any
}

export type SortConfig = {
  fieldId: string
  direction: 'asc' | 'desc'
}

export type WidgetLayout = {
  row: number
  col: number
  colSpan: number
}

export type WidgetStyle = {
  showLegend?: boolean
  legendPosition?: 'top' | 'right' | 'bottom' | 'left'
  colorScheme?: string
  numberFormatOverrides?: Record<string, string>
}

export type WidgetConfig = {
  id: string
  type: ReportWidgetType
  title: string
  dataSourceId: string
  dimensions: DimensionConfig[]
  metrics: MetricConfig[]
  filters: FilterConfig[]
  sorts: SortConfig[]
  limit?: number
  layout: WidgetLayout
  style?: WidgetStyle
}

export type DateRangeKind = 'last_7_days' | 'last_30_days' | 'this_month' | 'custom'

export type ReportDateRange = {
  kind: DateRangeKind
  start?: string
  end?: string
}

export type ReportConfig = {
  id: string
  name: string
  description?: string
  widgets: WidgetConfig[]
  defaultDateRange?: ReportDateRange
}

export type WidgetResultColumn = {
  id: string
  label: string
  type: 'string' | 'number' | 'date'
}

export type WidgetResult = {
  columns: WidgetResultColumn[]
  rows: any[][]
}

export type DataField = {
  id: string
  label: string
  type: 'string' | 'number' | 'date' | 'enum' | 'relation'
  isMetric: boolean
  description?: string
}

export type DataSource = {
  id: string
  label: string
}
