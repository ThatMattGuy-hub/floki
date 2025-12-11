# Project Management System - Frontend

Modern web frontend for the project management platform built with Nuxt 3, Vue 3, and Tailwind CSS.

## Features

- **Modern UI**: Beautiful, responsive interface with dark mode support
- **Authentication**: Secure login/registration with JWT tokens
- **Role-Based Access**: Different views and permissions based on user roles
- **Task Management**: Create, view, and manage tasks with rich details
- **Real-time Updates**: Instant feedback and updates
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 AA compliant

## Tech Stack

- **Nuxt 3**: Vue.js framework
- **Vue 3**: Progressive JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **Pinia**: State management
- **TypeScript**: Type-safe development

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   API_BASE_URL=http://localhost:3000/api/v1
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3001`

4. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
frontend/
├── assets/          # CSS and static assets
├── components/      # Vue components
├── composables/     # Vue composables
├── layouts/         # Page layouts
├── middleware/      # Route middleware
├── pages/           # Application pages
├── plugins/         # Nuxt plugins
├── public/          # Public static files
├── stores/          # Pinia stores
├── types/           # TypeScript types
└── nuxt.config.ts   # Nuxt configuration
```

## Key Features

### Authentication
- Secure login/registration
- JWT token management
- Automatic token refresh
- Protected routes

### Task Management
- List view with filtering and pagination
- Detailed task view with all information
- Create/update/delete tasks
- Comments and mentions
- Watchers and notifications

### User Experience
- Dark mode by default
- Smooth animations
- Loading states
- Error handling
- Toast notifications

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions

## Development

### Code Style
- TypeScript for type safety
- Vue 3 Composition API
- Composables for shared logic
- Pinia stores for state management

### Components
- Reusable UI components
- Consistent design system
- Accessible by default

## License

Proprietary - All rights reserved

