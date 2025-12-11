# PRD02 – Frontend Architecture & Core UI (Cursor + Supabase)

## Overview
Implements a Vibe-coded frontend built in **Cursor** using **Nuxt 3 (Vue 3)** for Products/Projects/Tasks workspaces, triage/assignment boards, global search, comments with @mentions, file uploads to Supabase, and permissions-aware rendering. Includes responsive layouts, dark mode, and accessibility compliance. Connects to PRD01 APIs.

## Objectives
- Deliver an intuitive web UI for internal and external users with RBAC-aware components.
- Implement prioritization and assignment flows (triage board).
- Enable global search with filters and saved searches.
- Support custom fields, approvals, automations, and watchers.
- Ensure responsive, mobile-friendly, dark-mode-first design.

## Functional Requirements
### App Shell & Navigation
- Global layout with sidebar for Products → Projects → Tasks.
- User profile, dark mode toggle, and search bar.
- Navigation must dynamically filter available Projects/Tasks by RBAC permissions.

### Triage & Assignment
- “Unassigned Tasks” view for triage; drag-and-drop to assign or set priority.
- Bulk assignment (multi-select) for Managers/Admins.
- Quick-create Task form with optional blank assignee and immediate triage list visibility.

### Task Workspace
- Detail view: status, assignee, labels, due date, watchers, approvals.
- Custom fields (read/write per field-level permissions).
- Subtasks and checklists with inline editing.
- Comments with @mentions, agency tagging, and internal-only toggle.
- File uploads (via Supabase Storage) with previews and progress tracking.
- Approvals panel: step list, approvers, approve/reject buttons.
- Audit activity feed at the bottom of the Task view.

### Permissions-Aware UI
- Role-based visibility for fields and actions.
- Hide internal-only comments/fields from External Agencies.
- Disable edit buttons where permission denied.

### Search
- Global search bar with autocomplete and filters.
- Saved search creation and management (per-user).
- Searchable entities: Products, Projects, Tasks, Subtasks, Comments, Files, Agencies, Users.

### Reports Integration
- Embed links to report templates and saved dashboards (from PRD03).

### Settings Access
- Admin and Manager roles can manage statuses, labels, and automation presets (via PRD04 endpoints).

## Non-Functional Requirements
- Load time (First Meaningful Paint) < 2 seconds on standard broadband.
- Must meet WCAG 2.1 AA for accessibility.
- Offline caching for session state (basic).
- Dark mode as default visual theme.
- Mobile responsive (≤768px breakpoint).

## Technical Stack
- **Framework:** Nuxt 3 (Vue 3, TypeScript), running in Cursor.
- **Styling:** TailwindCSS + custom components (dark mode + responsive).
- **State Management:** Pinia or Vue signals (Vibe-compatible).
- **HTTP Client:** Fetch API with interceptors for JWT auth.
- **Uploads:** Direct-to-Supabase Storage via presigned URLs.
- **Search:** Integrate with PRD01 Meilisearch endpoints.
- **Accessibility:** Headless UI components; keyboard navigation support.
- **Observability:** Cursor DevTools + console tracing + Sentry (optional).

## Dependencies
- Internal: PRD01 (auth, tasks, search, storage, automations), PRD04 (settings).
- External: Supabase client SDK, Outlook SMTP via backend.

## Milestones & Deliverables
| Phase | Deliverable | Owner | Est. Duration | Dependency |
|------|-------------|-------|---------------|------------|
| 1 | App shell, layout, routing, and RBAC guards | Frontend | 4d | PRD01 auth |
| 2 | Product/Project browsing views | Frontend | 4d | 1 |
| 3 | Task workspace (core fields, subviews) | Frontend | 6d | 2 |
| 4 | Subtasks, checklists, watchers, @mentions | Frontend | 5d | 3 |
| 5 | Triage/assignment board | Frontend | 5d | 3 |
| 6 | File uploads to Supabase (preview, progress) | Frontend | 4d | 3 |
| 7 | Search bar, filters, saved searches | Frontend | 6d | PRD01 search |
| 8 | Settings and automation presets UI | Frontend | 5d | PRD04 settings |
| 9 | Approvals panel integration | Frontend | 4d | PRD01 approvals |

## Acceptance Criteria
- [ ] External Agency UI hides internal-only data and disables restricted actions.
- [ ] Triage board allows drag-to-assign, priority reordering, and inline edits.
- [ ] Task workspace supports watchers, @mentions, and file uploads.
- [ ] Custom fields render dynamically per template and enforce validation.
- [ ] Search results match API output and load < 2s.
- [ ] Dark mode toggle persists; responsive layout validated on mobile.
- [ ] Approvals panel fully operational; status transitions synced with backend.

## Risks & Mitigations
- Risk: Large data payloads slow task workspace → Mitigation: pagination and lazy loading.
- Risk: Upload interruptions on mobile → Mitigation: resumable uploads (Supabase multipart).
- Risk: RBAC logic divergence between frontend/backend → Mitigation: shared RBAC definitions in schema JSON.

## Success Metrics
- Median user completes triage and assignment in <3 clicks.
- ≥90% of updates performed from Task workspace without navigation.
- 0 visibility errors between internal and agency roles.
- Search perceived latency <1.5s average.

