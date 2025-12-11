# PRD01 – Backend, Auth, RBAC, Data Model & APIs

## Overview
Defines the core backend for a Cursor-based project management platform built using modern Node.js architecture and Vibe conventions. This PRD covers authentication, multi-level RBAC, org/team/user models, projects & products, tasks with subtasks and checklists, custom fields (global library with field-level visibility), files/media on Supabase Storage, audit logging, global search, approvals & automations (IFTTT), email notifications (Outlook SMTP/Graph), and watchers/@mentions. Exposes REST/JSON APIs for frontend and integrations.

## Objectives
- Secure email+password auth with roles: Owner, Admin, Manager, Contributor, External Agency, Viewer.
- Enforce visibility so external agencies only see items where their agency or they are assigned/tagged.
- Model Tasks linked to both Project and Product; support subtasks, checklists, watchers, and agencies tagging.
- Deliver global custom fields (with per-field visibility rules) and global statuses/labels.
- Ship a scalable search index with filtering, saved searches, fuzzy/synonym support.
- Provide approvals and an automation engine (IFTTT) over task events/fields.
- Email notifications for triggers including @mentions, assignments, status/date changes, SLAs.
- Full audit log.

## Functional Requirements
- **Auth & Org**
  - Email/password login; password reset; optional 2FA (stretch).
  - Users can belong to multiple Teams; Teams can include Agencies (agency flag).
  - Roles: Owner, Admin, Manager, Contributor, External Agency, Viewer.
- **RBAC & Visibility**
  - External Agency users: same UI surface but can only read items where (a) assigned to task/subtask, (b) their agency is tagged on Project/Product/Task, or (c) @mentioned or added as watcher.
  - Field-level visibility: mark any field as “internal-only”; hidden from External Agency roles.
- **Core Objects**
  - **Product** (e.g., “Hippo Leasing Website”).
  - **Project** (e.g., “Application Form”) belongs to a Product.
  - **Task** belongs to Project **and** Product; must have an “Owner/Assignee” (can be blank at creation to allow triage).
  - **Subtask**, **Checklist items** within Task.
  - **Labels** (global, color-coded). **Statuses** (global workflow).
  - **Agencies** (org entities), can be tagged on Products/Projects/Tasks.
  - **Watchers** and **@mentions** in comments.
  - **Custom Fields**: global library; types: text, number, date, select, multiselect, user/team, URL, currency, files, images, videos, JSON.
- **Files & Media**
  - Upload to Supabase Storage; max file size: 100 MB (supports ≥60s 1080p H.264 @ ~10 Mbps).
  - Image previews, video thumbnails; AV scanning (via Supabase Edge Functions or third-party scanning service).
- **Approvals**
  - Configurable approval steps per Task/Project (e.g., Manager approval required before agency visibility or before status transition).
- **Automations (IFTTT)**
  - Triggers: status change, due/approaching, SLA breach, field change, assignment change, @mention.
  - Conditions: field values, role/team/agency, product/project.
  - Actions: change status/assignee/labels, add watcher, create subtask, send email.
- **Search**
  - Indexed objects: Products, Projects, Tasks, Subtasks, Comments, Files, Agencies, Users, Custom field values.
  - Features: filters, saved searches, query syntax, typo-tolerance/fuzzy, synonyms; results < 2s p95.
- **Notifications**
  - Channel: Email (MVP). Digest/quiet hours: out-of-scope MVP.
  - SMTP via Outlook / Microsoft 365; or Microsoft Graph mail send (decide at implementation).
- **Audit**
  - Immutable event log: who did what, when; includes reads for sensitive items, configuration changes, and automation runs.

## Non-Functional Requirements
- p95 API latency < 300 ms, search < 2 s.
- Secure login; encryption in transit; at-rest via Supabase managed Postgres encryption.
- Mobile-friendly via frontend (Nuxt).
- Cost-effective stack, horizontal scale; minimal vendor lock-in.

## Technical Stack
- **Runtime**: Node.js (LTS), Express (REST), integrated with Cursor.
- **DB**: Supabase Postgres (primary), Redis (for queues/rate limits).
- **Search**: Meilisearch (self-hosted) with synonyms & fuzzy search.
- **Queue/Workers**: BullMQ (Redis) for emails, automations, thumbnails, AV scan.
- **Storage**: Supabase Storage (S3-compatible).
- **Email**: Microsoft 365 SMTP or Graph API.
- **Auth**: Supabase Auth (email/password) + JWT (short-lived) + refresh tokens.
- **Observability**: Supabase monitoring, structured logs, health checks.

## Dependencies
- Internal: PRD02 (frontend), PRD03 (reports), PRD04 (admin/workflows).
- External: Supabase, Redis, Outlook/Graph, Meilisearch.

## Milestones & Deliverables
| Phase | Deliverable | Owner | Est. Duration | Dependency |
|------|-------------|-------|---------------|------------|
| 1 | Auth, Users, Teams, Agencies | Backend | 4d | None |
| 2 | RBAC & visibility guards | Backend | 5d | 1 |
| 3 | Products/Projects/Tasks schema & CRUD | Backend | 6d | 1 |
| 4 | Subtasks, Checklists, Watchers, @mentions | Backend | 4d | 3 |
| 5 | Custom Fields (global lib) | Backend | 5d | 3 |
| 6 | Files to Supabase Storage, thumbnails | Backend | 5d | 3 |
| 7 | Approvals & Automation engine | Backend | 7d | 3 |
| 8 | Search indexer + saved searches | Backend | 6d | 3 |
| 9 | Email notifications via Outlook/Graph | Backend | 3d | 7 |
| 10 | Audit log service | Backend | 3d | 2 |

## Acceptance Criteria
- [ ] External Agency user restricted to assigned/tagged/mentioned/watched items.
- [ ] Field-level visibility hides internal-only data from agencies.
- [ ] Tasks must be assigned before leaving “Unassigned” status.
- [ ] Subtasks/checklists CRUD complete.
- [ ] Custom fields validated per type and attachable globally.
- [ ] Supabase file uploads ≤100 MB; thumbnails generated.
- [ ] Approvals block transitions until complete.
- [ ] Automations trigger on defined events.
- [ ] Search results under 2s, filtered by permissions.
- [ ] Outlook email notifications sent successfully.
- [ ] All critical actions logged in audit trail.

## Risks & Mitigations
- Risk: Visibility leaks → Mitigation: enforce ACL in query layer.
- Risk: File scanning delay → Mitigation: async processing.
- Risk: Outlook SMTP limits → Mitigation: use Graph API fallback.
- Risk: Automation overload → Mitigation: rule limits, validation.

## Success Metrics
- 0 data visibility leaks.
- ≥99% notification success rate.
- p95 API latency < 300 ms; search < 2 s.
- < 1% failed automation runs over 7 days.
