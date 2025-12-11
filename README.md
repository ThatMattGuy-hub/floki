# Project Management System

A comprehensive, enterprise-grade project management platform built with modern technologies. Supports multi-level RBAC, external agency collaboration, custom workflows, automations, and extensive reporting capabilities.

## Overview

This system provides a complete solution for managing projects, tasks, teams, and external agency collaborations with advanced features including:

- **Multi-Role RBAC**: Owner, Admin, Manager, Contributor, External Agency, and Viewer roles
- **External Agency Visibility**: Granular control over what external agencies can see and access
- **Task Management**: Rich task features including subtasks, checklists, watchers, @mentions
- **Custom Fields**: Global custom field library with field-level visibility controls
- **Approvals & Workflows**: Multi-step approval processes
- **Automations**: IFTTT-style automation engine for task events
- **File Management**: Upload to Supabase Storage with thumbnail generation
- **Search**: Fast, fuzzy search powered by Meilisearch
- **Reports**: Custom report builder with CSV, XLSX, and PDF exports
- **Notifications**: Email notifications via Outlook/Microsoft Graph
- **SLA Monitoring**: Automatic breach detection and alerts
- **Audit Logging**: Comprehensive audit trail for compliance

## Architecture

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Search**: Meilisearch
- **Queue**: BullMQ (Redis)
- **Email**: Nodemailer with Outlook SMTP / Microsoft Graph
- **Storage**: Supabase Storage (S3-compatible)

### Frontend
- **Framework**: Nuxt 3 (Vue 3)
- **Styling**: Tailwind CSS
- **State**: Pinia
- **Language**: TypeScript
- **Features**: Dark mode, responsive design, WCAG 2.1 AA compliant

## Quick Start

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL (via Supabase)
- Redis
- Meilisearch (optional, for search functionality)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd project_management
   ```

2. **Set up Supabase**:
   - The database migrations have already been applied
   - Update your environment variables with Supabase credentials

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   echo "SUPABASE_URL=your_url\nSUPABASE_ANON_KEY=your_key\nAPI_BASE_URL=http://localhost:3000/api/v1" > .env
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Project Structure

```
project_management/
├── backend/              # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Helper functions
│   └── package.json
├── frontend/            # Frontend app (Nuxt 3)
│   ├── assets/         # CSS and static assets
│   ├── components/     # Vue components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Application pages
│   ├── stores/         # Pinia stores
│   └── package.json
├── PRDs/               # Product Requirement Documents
│   ├── PRD01_Backend_Auth_RBAC_APIs.md
│   ├── PRD02_Frontend_Architecture_Core_UI.md
│   ├── PRD03_Report_Builder_Exports.md
│   ├── PRD04_Admin_Console_Settings_Workflows.md
│   └── PRD05_Notifications_Alerts_SLA_Monitoring.md
└── README.md
```

## Features

### Authentication & Authorization
- Secure email/password authentication via Supabase Auth
- JWT-based session management with automatic token refresh
- Six-tier role system with granular permissions
- Row-level security policies in database

### External Agency Collaboration
External Agency users have restricted visibility and can only see:
- Tasks where they are assigned
- Tasks where their agency is tagged
- Tasks where they are watchers
- Tasks where they are @mentioned

Internal-only fields and comments are automatically hidden from external users.

### Task Management
- Full CRUD operations for tasks
- Subtasks and checklist items
- Watchers and @mentions
- Custom fields with validation
- File attachments with previews
- Comments with mentions
- Labels and status tracking
- Due dates and SLA tracking

### Automations (IFTTT)
Create automation rules with:
- **Triggers**: Status change, assignment, due date, SLA breach, etc.
- **Conditions**: Field values, roles, teams, agencies
- **Actions**: Change status/assignee, add labels, send emails, create subtasks

### Approval Workflows
- Multi-step approval processes
- Sequential or parallel approval steps
- Role-based or user-specific approvers
- Approval blocking for status transitions

### Reports & Analytics
- Visual report builder
- Multiple data sources (tasks, projects, products, users)
- Filters, grouping, and aggregations
- Exports to CSV, XLSX, and PDF
- Scheduled email delivery
- Shareable dashboards

### Search
- Fast, typo-tolerant search
- Search across tasks, projects, products, comments, files
- Advanced filters and saved searches
- Sub-2-second response times

### Notifications
- Email notifications via Outlook/Microsoft Graph
- Configurable triggers (assignments, mentions, status changes, SLA alerts)
- Per-user notification preferences
- Template-based emails with variables

### SLA Monitoring
- Configurable SLA rules per product/project
- Automatic breach detection
- Due soon alerts
- Escalation workflows

### Audit Logging
- Immutable audit trail
- Tracks all critical operations
- Filterable by user, entity type, date range
- Export to CSV for compliance

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | System owner | Full access to all features |
| **Admin** | Administrator | Manage settings, users, workflows |
| **Manager** | Team manager | Manage teams, projects, tasks |
| **Contributor** | Regular user | Create and update tasks |
| **External Agency** | External collaborator | Restricted visibility (assigned/tagged items only) |
| **Viewer** | Read-only user | View-only access |

## API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### Tasks
- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/:id` - Get task details
- `POST /api/v1/tasks` - Create task
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `GET /api/v1/tasks/:id/comments` - Get comments
- `POST /api/v1/tasks/:id/comments` - Add comment

## Database Schema

The application uses a PostgreSQL database (via Supabase) with the following main tables:

- `users` - User profiles and roles
- `agencies` - External agency organizations
- `teams` - Team structures
- `products` - Product portfolio
- `projects` - Projects within products
- `tasks` - Tasks with full metadata
- `subtasks` - Task subtasks
- `checklist_items` - Task checklist items
- `comments` - Task comments
- `watchers` - Task watchers
- `labels` - Global labels
- `statuses` - Workflow statuses
- `custom_fields` - Custom field definitions
- `automation_rules` - Automation rules
- `approval_workflows` - Approval workflow definitions
- `notifications` - Notification queue
- `audit_logs` - Audit trail
- `reports` - Saved reports

All tables use Row Level Security (RLS) policies to enforce permissions.

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.office365.com
SMTP_USER=your_email@company.com
SMTP_PASSWORD=your_password
MEILISEARCH_HOST=http://localhost:7700
```

### Frontend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
API_BASE_URL=http://localhost:3000/api/v1
```

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set environment variables
3. Run: `node dist/index.js`

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy the `.output` directory to your hosting provider
3. Configure environment variables

Recommended platforms:
- Backend: Render, Railway, Heroku, AWS
- Frontend: Vercel, Netlify, Cloudflare Pages
- Database: Supabase (managed PostgreSQL)
- Storage: Supabase Storage

## Security

- All API endpoints require authentication
- Row-level security (RLS) enforced at database level
- JWT tokens with short expiration times
- Refresh tokens for session management
- HTTPS enforced in production
- Input validation and sanitization
- SQL injection protection via parameterized queries
- XSS protection via Content Security Policy
- CORS configured for known origins only

## Performance

- API response times: < 300ms (p95)
- Search latency: < 2s (p95)
- Database queries optimized with indexes
- Connection pooling for database
- Redis caching for frequently accessed data
- File upload optimizations (chunking, resumable)
- Frontend code splitting and lazy loading

## Compliance & Audit

- Complete audit trail for all critical actions
- Immutable audit logs
- User action tracking
- Configuration change logging
- Automation execution logs
- CSV export for compliance reporting
- WCAG 2.1 AA accessibility compliance

## Support

For issues, questions, or feature requests, please refer to the PRD documents in the `/PRDs` directory.

## License

Proprietary - All rights reserved

---

Built with ❤️ using modern web technologies

