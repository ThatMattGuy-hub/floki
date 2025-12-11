# Reports 2.0 - Looker Studio-Style Interactive Reporting

## Overview

Reports 2.0 is a complete rebuild of the reporting interface, inspired by Google Looker Studio. It provides a drag-and-drop interface for building interactive reports with dimensions, metrics, filters, and multiple visualization types.

## Key Features

### 🎨 **3-Panel Looker Studio Layout**
- **Left Panel (Data)**: Browse data sources and drag fields
- **Center Panel (Canvas)**: Visual report builder with widget grid
- **Right Panel (Configuration)**: Configure selected widgets with Data & Style tabs

### 📊 **Visualization Types**
- **Table**: Tabular data display
- **Bar Chart**: Vertical bar charts with multiple series
- **Line Chart**: Time-series and trend analysis
- **Pie Chart**: Proportional data visualization
- **Scorecard**: Single-metric KPI cards

### 🔧 **Interactive Configuration**
- Drag-and-drop fields from data panel to widget configuration
- Real-time query execution with debouncing
- Configurable aggregations (sum, avg, min, max, count, count_distinct)
- Flexible filtering with multiple operators
- Sorting and row limits
- Customizable chart styles and legends

### 📁 **Data Sources**
- Tasks
- Projects
- Products
- Agencies
- Users
- Audit Logs

## Architecture

### Frontend (Vue 3 + TypeScript)

**Components:**
```
frontend/
├── types/
│   └── reporting.ts                    # Shared TypeScript types
├── composables/
│   └── useReporting.ts                 # API hooks and widget query logic
├── components/reports2/
│   ├── DataPanel.vue                   # Left panel: data sources & fields
│   ├── FieldGroup.vue                  # Field grouping (dimensions/metrics)
│   ├── FieldPill.vue                   # Draggable field component
│   ├── Canvas.vue                      # Center panel: widget grid
│   ├── WidgetCard.vue                  # Individual widget container
│   ├── AddWidgetButton.vue             # Widget type selector
│   ├── WidgetConfigPanel.vue           # Right panel: configuration
│   ├── config/
│   │   ├── DataTab.vue                 # Data configuration tab
│   │   └── StyleTab.vue                # Style configuration tab
│   └── visualizations/
│       ├── TableWidget.vue             # Table visualization
│       ├── BarChartWidget.vue          # Bar chart (Chart.js)
│       ├── LineChartWidget.vue         # Line chart (Chart.js)
│       ├── PieChartWidget.vue          # Pie chart (Chart.js)
│       └── ScorecardWidget.vue         # KPI scorecard
└── pages/reports2/
    ├── index.vue                       # Reports 2.0 list page
    └── [id].vue                        # Report builder page
```

**Key Types:**
- `ReportConfig`: Top-level report configuration
- `WidgetConfig`: Individual widget configuration
- `DimensionConfig`: Dimension field configuration
- `MetricConfig`: Metric field with aggregation
- `FilterConfig`: Filter conditions
- `WidgetResult`: Query result format

### Backend (Node.js + Express + Supabase)

**Endpoints:**
```
GET    /api/v1/reports2                    # List all reports
GET    /api/v1/reports2/:id                # Get report by ID
POST   /api/v1/reports2                    # Create new report
PATCH  /api/v1/reports2/:id                # Update report
DELETE /api/v1/reports2/:id                # Delete report
POST   /api/v1/reports/run-widget          # Execute widget query
GET    /api/v1/reports/data-sources/:id/fields  # Get available fields
```

**Files:**
```
backend/
├── src/
│   ├── routes/
│   │   └── report2.routes.ts           # Reports 2.0 routes
│   └── controllers/
│       └── report2Controller.ts        # Reports 2.0 controller
└── migrations/
    └── 008_create_reports2_table.sql   # Database schema
```

### Database Schema

**Table: `reports2`**
```sql
- id (UUID, primary key)
- name (VARCHAR, required)
- description (TEXT)
- widgets (JSONB) - Array of widget configurations
- default_date_range (JSONB)
- created_by (UUID, foreign key to users)
- is_shared (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Usage

### Creating a New Report

1. Navigate to **Reports 2.0** in the sidebar
2. Click **"New Report"**
3. Add widgets using the **"+ Add Chart"** button
4. Select a widget type (table, bar, line, pie, scorecard)
5. Drag fields from the left **Data Panel** into the configuration zones
6. Configure filters, sorts, and styling in the right panel
7. Click **"Save"** to persist the report

### Configuring Widgets

**Data Tab:**
- **Title**: Widget display name
- **Data Source**: Select from available sources
- **Dimensions**: Drag fields for grouping/X-axis
- **Metrics**: Drag numeric fields for aggregation/Y-axis
- **Filters**: Add field-level filters with operators
- **Row Limit**: Maximum rows to display

**Style Tab:**
- **Show Legend**: Toggle legend visibility
- **Legend Position**: Top, right, bottom, left
- **Color Palette**: Predefined color schemes
- **Widget Width**: Grid column span (3, 4, 6, 8, 12 cols)

### Drag-and-Drop Workflow

1. Select a data source in the left panel
2. Browse **Dimensions** (text, dates, enums) and **Metrics** (numbers)
3. Drag a field to the **Dimensions** drop zone for grouping
4. Drag a field to the **Metrics** drop zone for aggregation
5. The widget automatically queries and updates

## Technical Details

### Debounced Querying

Widget queries are debounced (400ms) to prevent excessive API calls during configuration changes. Implemented in `useWidgetQuery` composable.

### Native Drag-and-Drop

Uses native HTML5 drag-and-drop API (no external library required):
- `FieldPill.vue`: Draggable source with `draggable="true"`
- `DataTab.vue`: Drop zones with `@dragover`, `@drop` handlers
- Data transfer via `application/json` MIME type

### Chart.js Integration

Visualizations use `vue-chartjs` (already in dependencies):
- Responsive charts with `maintainAspectRatio: false`
- Configurable legends, tooltips, and colors
- Dark mode compatible

### Query Execution

Backend controller (`report2Controller.ts`) transforms widget config into Supabase queries:
- Filters → `.eq()`, `.neq()`, `.gt()`, `.lt()`, `.in()`, `.ilike()`
- Sorts → `.order()`
- Limits → `.limit()`
- Aggregations → Grouped in-memory (basic implementation)

## Migration Steps

### 1. Run Database Migration

```bash
# Apply the migration to create reports2 table
psql -d your_database -f backend/migrations/008_create_reports2_table.sql
```

Or via Supabase dashboard:
- Navigate to SQL Editor
- Paste contents of `008_create_reports2_table.sql`
- Execute

### 2. Restart Backend

```bash
cd backend
npm run dev
```

The `/api/v1/reports2` endpoints will now be available.

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3001/reports2`

## Coexistence with Reports 1.0

Reports 2.0 runs **alongside** the original reporting system:
- **Reports 1.0**: `/reports` (existing Vue-based reports)
- **Reports 2.0**: `/reports2` (new Looker Studio-style interface)
- Separate database tables (`reports` vs `reports2`)
- Separate API endpoints (`/api/v1/reports` vs `/api/v1/reports2`)

Users can access both systems via the sidebar navigation.

## Future Enhancements

### Planned Features
- [ ] Advanced aggregations (GROUP BY with multiple dimensions)
- [ ] Date range filters with presets (last 7 days, this month, etc.)
- [ ] Export to CSV/PDF
- [ ] Scheduled report delivery
- [ ] Report templates
- [ ] Drill-down interactions
- [ ] Cross-filtering between widgets
- [ ] Custom SQL queries for power users
- [ ] Real-time collaboration
- [ ] Widget resize and drag-to-reorder

### Performance Optimizations
- [ ] Query result caching
- [ ] Incremental data loading for large datasets
- [ ] Server-side aggregations (move from in-memory to SQL)
- [ ] Materialized views for common queries

## Troubleshooting

### Widget not updating after configuration change
- Check browser console for API errors
- Verify debounce timeout (400ms) has elapsed
- Ensure dimensions or metrics are configured

### Drag-and-drop not working
- Verify browser supports HTML5 drag-and-drop
- Check console for JavaScript errors
- Ensure `FieldPill` has `draggable="true"`

### Backend query errors
- Check Supabase table names match data source IDs
- Verify field names exist in the database
- Review backend logs for SQL errors

### Charts not rendering
- Ensure Chart.js is registered in component
- Check `WidgetResult` format matches expected structure
- Verify data contains numeric values for metrics

## API Examples

### Create a Report

```bash
POST /api/v1/reports2
Content-Type: application/json

{
  "name": "Task Status Overview",
  "description": "Breakdown of tasks by status",
  "widgets": [
    {
      "id": "widget-1",
      "type": "bar",
      "title": "Tasks by Status",
      "dataSourceId": "tasks",
      "dimensions": [
        { "fieldId": "tasks.status", "label": "Status" }
      ],
      "metrics": [
        { "fieldId": "tasks.count", "label": "Count", "aggregation": "count" }
      ],
      "filters": [],
      "sorts": [],
      "limit": 100,
      "layout": { "row": 0, "col": 0, "colSpan": 6 }
    }
  ]
}
```

### Execute a Widget Query

```bash
POST /api/v1/reports/run-widget
Content-Type: application/json

{
  "dataSourceId": "tasks",
  "dimensions": [
    { "fieldId": "tasks.status", "label": "Status" }
  ],
  "metrics": [
    { "fieldId": "tasks.count", "label": "Count", "aggregation": "count" }
  ],
  "filters": [
    { "fieldId": "tasks.is_archived", "operator": "equals", "value": false }
  ],
  "limit": 50
}
```

## Contributing

When adding new features to Reports 2.0:

1. **Add types** to `frontend/types/reporting.ts`
2. **Update composables** in `frontend/composables/useReporting.ts`
3. **Create/modify components** in `frontend/components/reports2/`
4. **Update backend controller** in `backend/src/controllers/report2Controller.ts`
5. **Test thoroughly** with various data sources and configurations
6. **Update this README** with new features and examples

## License

Same as the main project.
