# Reports 2.0 - Quick Setup Guide

## Prerequisites

- Backend and frontend already running
- Supabase database configured
- Node.js and npm installed

## Setup Steps

### 1. Apply Database Migration

Run the migration to create the `reports2` table:

**Option A: Via Supabase Dashboard**
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `backend/migrations/008_create_reports2_table.sql`
4. Paste and execute

**Option B: Via psql**
```bash
psql -d your_database_url -f backend/migrations/008_create_reports2_table.sql
```

### 2. Restart Backend Server

The backend routes are already registered. Just restart:

```bash
cd backend
npm run dev
```

Verify the endpoints are available:
- `GET /api/v1/reports2` - List reports
- `POST /api/v1/reports/run-widget` - Execute widget queries

### 3. Start Frontend (if not running)

```bash
cd frontend
npm run dev
```

### 4. Access Reports 2.0

Navigate to: `http://localhost:3001/reports2`

You should see:
- "Reports 2.0" in the sidebar with a "New" badge
- Empty state with "Create Report" button
- Link back to original Reports 1.0

## Testing the Feature

### Create Your First Report

1. Click **"New Report"** or **"Create Report"**
2. You'll see the 3-panel layout:
   - **Left**: Data sources (Tasks, Projects, etc.)
   - **Center**: Empty canvas
   - **Right**: Configuration panel (disabled until widget selected)

3. Click **"+ Add Chart"** and select **"Table"**

4. In the **Left Panel**:
   - Click on **"Tasks"** data source
   - You'll see Dimensions and Metrics

5. **Drag a field** from the left panel:
   - Drag "Status" to the **Dimensions** drop zone (right panel)
   - Drag "Task Count" to the **Metrics** drop zone

6. The table should automatically populate with data!

7. Click **"Save"** to persist the report

### Try Different Visualizations

1. Add another widget: **"+ Add Chart"** → **"Bar Chart"**
2. Configure dimensions and metrics
3. Switch to the **Style** tab to customize:
   - Legend position
   - Color palette
   - Widget width

### Add Filters

1. Select a widget
2. In the **Data** tab, scroll to **Filters**
3. Click **"+ Add filter"**
4. Enter:
   - Field: `tasks.is_archived`
   - Operator: `equals`
   - Value: `false`
5. The widget updates automatically

## Troubleshooting

### "Reports 2.0" not showing in sidebar
- Clear browser cache and refresh
- Verify `frontend/layouts/default.vue` has the Reports 2.0 link

### Backend errors on widget query
- Check backend console for errors
- Verify database table names match data source IDs
- Ensure migration was applied successfully

### Drag-and-drop not working
- Try a different browser (Chrome/Firefox recommended)
- Check browser console for JavaScript errors
- Verify `FieldPill.vue` has `draggable="true"`

### Charts not rendering
- Open browser DevTools → Console
- Look for Chart.js registration errors
- Verify `vue-chartjs` is installed: `npm list vue-chartjs`

## Next Steps

- Explore different data sources (Projects, Products, Agencies)
- Try all visualization types (Table, Bar, Line, Pie, Scorecard)
- Experiment with filters and aggregations
- Create multiple widgets on a single report
- Share reports with your team (set `is_shared` to true)

## Need Help?

Refer to the full documentation: `REPORTS_2.0_README.md`

## Feature Highlights

✅ **Drag-and-drop** field configuration  
✅ **Real-time** query execution  
✅ **5 visualization types** (Table, Bar, Line, Pie, Scorecard)  
✅ **Flexible filtering** with 7+ operators  
✅ **Customizable styling** (legends, colors, layout)  
✅ **Dark mode** compatible  
✅ **Coexists** with Reports 1.0  

Enjoy building beautiful, interactive reports! 🎉
