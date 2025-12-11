# Project Management System - Backend API

Backend API for a comprehensive project management platform built with Node.js, Express, and Supabase.

## Features

- **Authentication & Authorization**: Supabase Auth with multi-role RBAC (Owner, Admin, Manager, Contributor, External Agency, Viewer)
- **Task Management**: Full CRUD operations with subtasks, checklists, watchers, and @mentions
- **External Agency Visibility**: Advanced permission system to restrict data visibility for external agency users
- **Custom Fields**: Global custom field library with field-level visibility controls
- **Approvals & Automations**: IFTTT-style automation engine with approval workflows
- **File Management**: Upload to Supabase Storage with thumbnail generation
- **Search**: Meilisearch integration for fast, fuzzy searching
- **Notifications**: Email notifications via Outlook/Microsoft Graph
- **Reports**: Custom report builder with CSV, XLSX, and PDF exports
- **Audit Logging**: Comprehensive audit trail for all critical actions
- **SLA Monitoring**: Automatic SLA breach detection and alerts

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Search**: Meilisearch
- **Queue**: BullMQ (Redis)
- **Email**: Nodemailer with Outlook SMTP / Microsoft Graph
- **File Processing**: Sharp (images), FFmpeg (videos)
- **Exports**: ExcelJS (XLSX), Puppeteer (PDF)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your Supabase credentials and other configuration.

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/password-reset/request` - Request password reset
- `POST /api/v1/auth/password-reset/confirm` - Confirm password reset

### Task Endpoints

- `GET /api/v1/tasks` - List tasks (with pagination and filters)
- `GET /api/v1/tasks/:id` - Get task details
- `POST /api/v1/tasks` - Create task
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `GET /api/v1/tasks/:id/comments` - Get task comments
- `POST /api/v1/tasks/:id/comments` - Add comment

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   └── index.ts         # Application entry point
├── logs/                # Log files
├── package.json
├── tsconfig.json
└── README.md
```

## Role-Based Access Control

### Roles

1. **Owner**: Full system access
2. **Admin**: Manage settings, users, and all content
3. **Manager**: Manage teams, projects, and tasks
4. **Contributor**: Create and update tasks
5. **External Agency**: Limited visibility (only assigned/tagged/mentioned items)
6. **Viewer**: Read-only access

### External Agency Visibility Rules

External Agency users can only see tasks where they are:
- Assigned to the task or a subtask
- Their agency is tagged on the task/project/product
- Added as a watcher
- @mentioned in comments

## Development

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## License

Proprietary - All rights reserved

