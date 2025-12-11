# Project Management System - Setup Guide

Complete guide to setting up and running the project management system from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Redis** (optional) - For queue management
- **Meilisearch** (optional) - For search functionality

## Part 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - Enter project name
   - Enter database password (save this!)
   - Select region closest to you
   - Click "Create new project"
5. Wait for project to be provisioned (2-3 minutes)

### 1.2 Get API Keys

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** (`SUPABASE_URL`)
   - **anon public** key (`SUPABASE_ANON_KEY`)
   - **service_role** key (`SUPABASE_SERVICE_ROLE_KEY`)

### 1.3 Database Migrations

The database migrations have already been applied through the Supabase MCP. Your database should have all necessary tables and RLS policies set up.

To verify, go to **Table Editor** in your Supabase dashboard and check for these tables:
- users
- agencies
- teams
- products
- projects
- tasks
- subtasks
- checklist_items
- watchers
- comments
- files
- etc.

### 1.4 Configure Supabase Storage

1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it `files`
4. Set it to **Private** (not public)
5. Click "Create bucket"

### 1.5 Configure Authentication

1. Go to **Authentication > Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email templates (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

## Part 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Redis Configuration (optional for now)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (Microsoft 365)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@company.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@company.com

# File Upload Configuration
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3001
```

### 2.3 Start Development Server

```bash
npm run dev
```

The backend API should now be running at `http://localhost:3000`

### 2.4 Verify Backend

Test the health check endpoint:

```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Part 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
API_BASE_URL=http://localhost:3000/api/v1
```

### 3.3 Start Development Server

```bash
npm run dev
```

The frontend should now be running at `http://localhost:3001`

### 3.4 Access the Application

Open your browser and go to `http://localhost:3001`

## Part 4: Create First User

### 4.1 Register Admin User

1. Go to `http://localhost:3001/login`
2. Click "Register here"
3. Fill in the registration form:
   - Email: admin@company.com
   - Password: (minimum 8 characters)
   - Full Name: Admin User
4. Click "Register"

### 4.2 Update User Role to Owner

Since the first user needs to be an Owner, update this in Supabase:

1. Go to **Table Editor > users** in Supabase dashboard
2. Find your newly created user
3. Edit the `role` field
4. Change it from `Viewer` to `Owner`
5. Click "Save"

### 4.3 Login

1. Go to `http://localhost:3001/login`
2. Enter your credentials
3. You should now have full access to the system

## Part 5: Optional Services

### 5.1 Redis Setup (for Queues)

If you want to enable background jobs and email queues:

**Using Docker:**
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

**Or install locally:**
- **Mac**: `brew install redis` then `brew services start redis`
- **Ubuntu/Debian**: `sudo apt-get install redis-server`
- **Windows**: Download from [Redis website](https://redis.io/download)

### 5.2 Meilisearch Setup (for Search)

If you want to enable advanced search:

**Using Docker:**
```bash
docker run -d --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=your_master_key_here \
  getmeili/meilisearch:latest
```

**Or install locally:**
```bash
curl -L https://install.meilisearch.com | sh
./meilisearch --master-key=your_master_key_here
```

Add to backend `.env`:
```bash
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_master_key_here
```

## Part 6: Email Configuration

### 6.1 Microsoft 365 / Outlook SMTP

If you have a Microsoft 365 account:

1. Enable SMTP in your Microsoft 365 admin center
2. Create an app password (if using MFA)
3. Update backend `.env`:
   ```bash
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=your_email@company.com
   SMTP_PASSWORD=your_app_password
   EMAIL_FROM=noreply@company.com
   ```

### 6.2 Test Email Configuration

You can test email sending by:

1. Creating a task
2. Assigning it to a user
3. Check the backend logs for email send status

## Part 7: Development Workflow

### 7.1 Running Both Servers

**Option 1: Two terminal windows**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Option 2: Concurrently (create a root package.json)**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\""
  }
}
```

### 7.2 Hot Reload

Both backend and frontend support hot reload:
- **Backend**: Changes to TypeScript files will restart the server
- **Frontend**: Changes will be reflected immediately in the browser

### 7.3 Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Part 8: Production Deployment

### 8.1 Build Backend

```bash
cd backend
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### 8.2 Build Frontend

```bash
cd frontend
npm run build
```

This creates a `.output/` folder ready for deployment.

### 8.3 Deployment Platforms

**Backend Recommendations:**
- Render.com
- Railway.app
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run

**Frontend Recommendations:**
- Vercel (optimal for Nuxt)
- Netlify
- Cloudflare Pages
- Vercel

**Database:**
- Supabase (managed PostgreSQL)

### 8.4 Environment Variables in Production

Make sure to set all environment variables in your hosting platform:
- Never commit `.env` files to version control
- Use platform-specific environment variable settings
- Update `CORS_ORIGIN` to your production frontend URL
- Update `FRONTEND_URL` to your production frontend URL

## Part 9: Troubleshooting

### Backend won't start

**Error: "Cannot find module"**
```bash
cd backend
rm -rf node_modules
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Find and kill process using port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend won't start

**Error: "Module not found"**
```bash
cd frontend
rm -rf node_modules .nuxt
npm install
```

**Error: "API connection failed"**
- Check that backend is running on port 3000
- Verify `API_BASE_URL` in frontend `.env`
- Check browser console for CORS errors

### Database connection issues

- Verify Supabase project is active
- Check API keys are correct
- Ensure RLS policies are enabled
- Check Supabase dashboard logs

### Authentication not working

- Verify Supabase Auth is enabled
- Check email provider settings
- Ensure user has correct role in database
- Clear browser cookies and try again

## Part 10: Next Steps

Now that your system is running:

1. **Create additional users** with different roles
2. **Create agencies** for external collaborators
3. **Create teams** and assign users
4. **Create products** for your organization
5. **Create projects** within products
6. **Start creating tasks**!

## Need Help?

- Check the main [README.md](./README.md) for feature documentation
- Review the PRDs in the `/PRDs` directory
- Check backend logs: `backend/logs/`
- Check Supabase logs in dashboard
- Enable debug logging: `NODE_ENV=development`

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Use strong, unique API keys
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging
- [ ] Review and test RLS policies
- [ ] Enable 2FA for admin accounts
- [ ] Set up regular security audits

---

Congratulations! Your project management system is now up and running. 🎉

