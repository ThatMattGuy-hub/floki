# Quick Start Guide

Get your project management system running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## 5-Minute Setup

### Step 1: Get Supabase Credentials (2 min)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Once ready, go to **Settings > API**
3. Copy these three values:
   ```
   Project URL
   anon public key
   service_role key
   ```

### Step 2: Create Storage Bucket (1 min)

1. In Supabase, go to **Storage**
2. Click "Create a new bucket"
3. Name it `files`
4. Make it **Private**
5. Click "Create"

### Step 3: Backend Setup (3 min)

```bash
# Install dependencies
cd backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3000
SUPABASE_URL=YOUR_PROJECT_URL
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_KEY
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001

# Optional: Email (can skip for now)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
EOF

# Start backend
npm run dev
```

Keep this terminal open!

### Step 4: Frontend Setup (2 min)

Open a NEW terminal:

```bash
# Install dependencies
cd frontend
npm install

# Create .env file
cat > .env << EOF
SUPABASE_URL=YOUR_PROJECT_URL
SUPABASE_ANON_KEY=YOUR_ANON_KEY
API_BASE_URL=http://localhost:3000/api/v1
EOF

# Start frontend
npm run dev
```

### Step 5: Access the App (1 min)

1. Open browser to `http://localhost:3001`
2. Click "Register here"
3. Create your account
4. You're in! 🎉

### Step 6: Make Yourself Owner (1 min)

Your first user needs Owner role:

1. Go to your Supabase dashboard
2. Click **Table Editor > users**
3. Find your user row
4. Click the `role` cell
5. Change `Viewer` to `Owner`
6. Refresh the app

Done! You now have full admin access.

## What You Can Do Now

✅ Create tasks
✅ Assign tasks
✅ Add comments with @mentions
✅ Upload files
✅ Create subtasks
✅ Add checklist items
✅ Watch tasks for updates
✅ Filter and search tasks
✅ Use dark mode (default)

## Quick Tips

### Create Your First Task

1. Click **Tasks** in sidebar
2. Click **New Task** button
3. Fill in:
   - Title (required)
   - Project ID and Product ID (you'll need to create these first via Supabase, or just use any UUID for testing)
   - Description
   - Assignee
   - Priority
4. Click Create

### Add Team Members

To add more users:

1. They register at `/register`
2. You update their role in Supabase **Table Editor > users**
3. Roles:
   - **Owner**: Full access
   - **Admin**: Manage settings
   - **Manager**: Manage teams/projects
   - **Contributor**: Create/edit tasks
   - **External Agency**: Limited visibility
   - **Viewer**: Read-only

### Create External Agency User

For testing the External Agency visibility:

1. Create a new user via `/register`
2. In Supabase, set their role to `External Agency`
3. Create an agency in the `agencies` table
4. Create a team linked to that agency
5. Add the user to that team
6. Tag the agency on a task

Now that user will ONLY see tasks where they're assigned, their agency is tagged, they're watching, or they're mentioned!

## Troubleshooting

### Backend won't start

**Check:**
- Node version: `node --version` (should be 18+)
- .env file exists in `backend/` folder
- All three Supabase values are set
- Port 3000 is available

**Fix:**
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Frontend won't start

**Check:**
- .env file exists in `frontend/` folder
- Backend is running on port 3000
- Port 3001 is available

**Fix:**
```bash
cd frontend
rm -rf node_modules .nuxt
npm install
npm run dev
```

### Can't login

**Check:**
- User was created (check Supabase **Authentication > Users**)
- Password is at least 8 characters
- Email is correct

**Fix:**
- Try password reset flow
- Or create new account

### API errors

**Check:**
- Backend terminal for errors
- Browser console (F12) for errors
- Supabase dashboard **Logs** section

### Database issues

**Check:**
- Migrations ran successfully (tables exist in Supabase **Table Editor**)
- RLS policies are enabled
- Your user exists in `users` table

## Next Steps

Now that it's running:

1. 📖 Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
2. 📋 Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for feature overview
3. 🎯 Review PRDs in `/PRDs` for detailed requirements
4. 💻 Start building!

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
npm run preview      # Preview production build
```

## Development Workflow

1. Make changes to code
2. Server auto-reloads (both backend and frontend)
3. Check browser/terminal for errors
4. Test your changes
5. Commit when ready

## Production Deployment

When ready to deploy:

1. Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) Part 8
2. Recommended platforms:
   - **Backend**: Render, Railway, Heroku
   - **Frontend**: Vercel, Netlify, Cloudflare Pages
   - **Database**: Supabase (already managed)

## Getting Help

- 📚 Check [README.md](./README.md) for features
- 🔧 Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- 📊 Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for status
- 🐛 Check browser console (F12) for frontend errors
- 📝 Check backend terminal for API errors
- 💾 Check Supabase dashboard for database issues

## Have Fun! 🚀

You're all set! Start building your project management workflow.

---

**Pro Tip**: Keep both terminal windows open while developing. The backend and frontend will auto-reload when you make changes!

