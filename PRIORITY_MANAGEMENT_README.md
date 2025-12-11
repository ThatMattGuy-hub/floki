# Priority Management Feature

## Overview
A drag-and-drop priority management system that allows senior management to easily prioritize projects and tasks within projects. This feature provides an intuitive interface for reordering items by simply dragging them to the desired position.

## Features

### Project Prioritization
- View all projects in a single list ordered by priority
- Drag and drop projects to reorder them
- Visual indicators showing priority rank (1, 2, 3, etc.)
- Display project details including product, owner, and description
- Save changes with a single click

### Task Prioritization
- Select a project to view its tasks
- Drag and drop tasks within a project to reorder them
- Visual indicators showing task priority rank
- Display task details including status, assignee, due date, and priority level
- Save changes with a single click

### User Experience
- **Intuitive drag handles**: Clear visual indicators for draggable items
- **Real-time feedback**: Items reorder immediately as you drag
- **Change tracking**: Save button only appears when changes are made
- **Permission-based access**: Only Owner, Admin, and Manager roles can access
- **Responsive design**: Works seamlessly on desktop and tablet devices
- **Dark mode support**: Fully compatible with light and dark themes

## Setup Instructions

### 1. Run Database Migration
Execute the migration to add the `priority_order` column to both projects and tasks tables:

```bash
cd backend
# Run the migration file: migrations/add_priority_order.sql
# This can be done through your Supabase dashboard or using a migration tool
```

The migration will:
- Add `priority_order` column to `projects` table
- Add `priority_order` column to `tasks` table
- Create indexes for better query performance
- Initialize existing records with priority values based on creation date

### 2. Install Frontend Dependencies
Install the vuedraggable package for drag-and-drop functionality:

```bash
cd frontend
npm install
```

### 3. Restart Services
Restart both backend and frontend services to apply changes:

```bash
# Backend
cd backend
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm run dev
```

## Usage

### Accessing Priority Management
1. Log in as a user with Owner, Admin, or Manager role
2. Click on "Priorities" in the left sidebar navigation
3. The priority management page will open

### Managing Project Priorities
1. Select the "Projects" view (default)
2. Drag projects using the handle icon (≡) on the left
3. Drop them in the desired position
4. Click "Save Changes" to persist the new order

### Managing Task Priorities
1. Select the "Tasks by Project" view
2. Choose a project from the dropdown
3. Drag tasks using the handle icon (≡) on the left
4. Drop them in the desired position
5. Click "Save Changes" to persist the new order

## API Endpoints

### Update Project Priorities
```
POST /api/v1/projects/priorities
```

**Request Body:**
```json
{
  "priorities": [
    { "id": "project-uuid-1", "priority_order": 1 },
    { "id": "project-uuid-2", "priority_order": 2 },
    { "id": "project-uuid-3", "priority_order": 3 }
  ]
}
```

**Response:**
```json
{
  "success": true
}
```

### Update Task Priorities
```
POST /api/v1/tasks/priorities
```

**Request Body:**
```json
{
  "priorities": [
    { "id": "task-uuid-1", "priority_order": 1 },
    { "id": "task-uuid-2", "priority_order": 2 },
    { "id": "task-uuid-3", "priority_order": 3 }
  ],
  "project_id": "project-uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

## Database Schema Changes

### Projects Table
```sql
ALTER TABLE projects ADD COLUMN priority_order INTEGER DEFAULT 0;
CREATE INDEX idx_projects_priority_order ON projects(priority_order);
```

### Tasks Table
```sql
ALTER TABLE tasks ADD COLUMN priority_order INTEGER DEFAULT 0;
CREATE INDEX idx_tasks_priority_order ON tasks(priority_order);
CREATE INDEX idx_tasks_project_priority ON tasks(project_id, priority_order);
```

## Files Modified/Created

### Backend
- `backend/migrations/add_priority_order.sql` - Database migration
- `backend/src/controllers/projectController.ts` - Added `updateProjectPriorities` function
- `backend/src/controllers/taskController.ts` - Added `updateTaskPriorities` function
- `backend/src/routes/project.routes.ts` - Added `/priorities` endpoint
- `backend/src/routes/task.routes.ts` - Added `/priorities` endpoint

### Frontend
- `frontend/pages/priorities/index.vue` - Main priority management page
- `frontend/layouts/default.vue` - Added navigation link
- `frontend/package.json` - Added vuedraggable dependency

## Permissions
Only users with the following roles can access and use the priority management feature:
- **Owner**: Full access
- **Admin**: Full access
- **Manager**: Full access

Users with Contributor, External Agency, or Viewer roles will not see the Priorities link in the navigation.

## Technical Details

### Frontend Technology
- **Vue 3 Composition API**: Modern reactive framework
- **vuedraggable**: Drag-and-drop library built on Sortable.js
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type-safe development

### Backend Technology
- **Express.js**: RESTful API framework
- **PostgreSQL (Supabase)**: Database with indexed priority columns
- **TypeScript**: Type-safe development

### Performance Considerations
- Indexes on `priority_order` columns ensure fast sorting queries
- Batch updates using `Promise.all()` for efficient priority saves
- Optimistic UI updates for immediate feedback

## Future Enhancements
Potential improvements for future versions:
- Bulk selection and reordering
- Keyboard shortcuts for reordering
- Undo/redo functionality
- Priority history and audit trail
- Export priority lists to CSV/PDF
- Nested task prioritization (subtasks)
- Cross-project task prioritization
- Priority templates and presets

## Troubleshooting

### Migration Issues
If the migration fails, ensure:
- You have proper database permissions
- No conflicting column names exist
- The database connection is active

### Drag-and-Drop Not Working
If drag-and-drop doesn't work:
- Ensure vuedraggable is properly installed: `npm install vuedraggable`
- Check browser console for JavaScript errors
- Verify the page has loaded completely
- Try refreshing the page

### Save Button Not Appearing
If the save button doesn't appear after reordering:
- Ensure you actually moved an item to a new position
- Check that you have the proper permissions (Owner/Admin/Manager)
- Verify the original order was loaded successfully

### Permission Denied
If you see "Insufficient permissions":
- Verify your user role is Owner, Admin, or Manager
- Log out and log back in to refresh your session
- Contact your system administrator to update your role

## Support
For issues or questions about the priority management feature, please contact your system administrator or refer to the main project documentation.
