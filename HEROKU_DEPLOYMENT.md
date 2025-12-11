# Floki - Heroku Deployment Guide

This guide walks you through deploying Floki to Heroku.

## Architecture Overview

- **Backend**: Express.js + TypeScript → Heroku
- **Frontend**: Nuxt 3 → Vercel/Netlify (recommended) or Heroku
- **Database**: Supabase (external managed PostgreSQL)
- **Storage**: Supabase Storage
- **Queue**: Redis (Heroku add-on)

## Prerequisites

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
2. Heroku account with billing enabled (for add-ons)
3. Supabase project with database configured
4. Git repository initialized

## Backend Deployment

### Step 1: Create Heroku App

```bash
cd backend
heroku create floki-api --region us
```

### Step 2: Add Buildpacks

The Puppeteer buildpack is required for PDF generation:

```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack
```

### Step 3: Add Redis Add-on

```bash
heroku addons:create heroku-redis:mini
```

### Step 4: Configure Environment Variables

```bash
# Required
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_ANON_KEY=your-anon-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com

# Optional - Email notifications
heroku config:set SMTP_HOST=smtp.office365.com
heroku config:set SMTP_USER=your-email@company.com
heroku config:set SMTP_PASSWORD=your-password

# Optional - Search (if using Meilisearch Cloud)
heroku config:set MEILISEARCH_HOST=https://your-meilisearch.cloud
heroku config:set MEILISEARCH_API_KEY=your-api-key
```

### Step 5: Deploy

```bash
# From the backend directory
git subtree push --prefix backend heroku main

# Or if backend is a separate repo:
git push heroku main
```

### Step 6: Verify Deployment

```bash
heroku open
# Should show the health check response
```

## Frontend Deployment

### Option A: Vercel (Recommended for Nuxt)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set build command: `npm run build`
4. Set output directory: `.output/public`
5. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `API_BASE_URL` (your Heroku backend URL)

### Option B: Netlify

1. Push your code to GitHub
2. Connect repository to Netlify
3. Set build command: `npm run generate`
4. Set publish directory: `.output/public`
5. Add environment variables (same as Vercel)

### Option C: Heroku (Not recommended for SSR)

If you must use Heroku for the frontend:

```bash
cd frontend
heroku create floki-app --region us
heroku buildpacks:add heroku/nodejs
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_ANON_KEY=your-key
heroku config:set API_BASE_URL=https://floki-api.herokuapp.com/api/v1
git push heroku main
```

## Environment Variables Reference

### Backend (Required)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `PORT` | Auto-set by Heroku |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `CORS_ORIGIN` | Frontend URL for CORS |
| `REDIS_URL` | Auto-set by Redis add-on |

### Backend (Optional)

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server for emails |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `MEILISEARCH_HOST` | Meilisearch server URL |
| `MEILISEARCH_API_KEY` | Meilisearch API key |

### Frontend

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `API_BASE_URL` | Backend API URL |

## Monitoring & Logs

```bash
# View logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart dynos
heroku restart
```

## Scaling

```bash
# Scale web dynos
heroku ps:scale web=2:standard-1x

# Upgrade Redis
heroku addons:upgrade heroku-redis:premium-0
```

## Troubleshooting

### Puppeteer Issues
If PDF generation fails, ensure the Puppeteer buildpack is installed:
```bash
heroku buildpacks
```

### Memory Issues
Upgrade to a larger dyno:
```bash
heroku ps:scale web=1:standard-2x
```

### Build Failures
Check Node.js version matches `engines` in package.json:
```json
"engines": {
  "node": ">=18.0.0"
}
```

## Cost Estimate (Heroku)

| Resource | Plan | Monthly Cost |
|----------|------|--------------|
| Web Dyno | Basic | $7 |
| Redis | Mini | $3 |
| **Total** | | **~$10/month** |

For production, consider:
- Standard-1X dyno (~$25/month)
- Premium Redis (~$15/month)

## Security Checklist

- [ ] All secrets stored in config vars (not in code)
- [ ] CORS_ORIGIN set to exact frontend domain
- [ ] HTTPS enforced (automatic on Heroku)
- [ ] Supabase RLS policies enabled
- [ ] Service role key only used server-side
