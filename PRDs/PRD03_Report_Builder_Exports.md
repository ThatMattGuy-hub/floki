# PRD03 – Report Builder & Exports (Cursor + Supabase)

## Overview
Implements the **Report Builder** module for the project management tool. Users can visually build, save, and share custom reports with charts, tables, and metrics across Products, Projects, Tasks, and Agencies. The builder supports role-based permissions, reusable templates, exports (CSV/XLSX/PDF), and scheduled email delivery through Outlook integration. Built for **Cursor** using Supabase as the database and data source.

## Objectives
- Allow non-technical users to create and share custom reports with no-code interface.
- Support exportable and schedulable reports in multiple formats.
- Enforce role-based access so external agencies only see data they can access.
- Provide reusable templates and interactive dashboards.

## Functional Requirements
### Report Builder
- Visual drag-and-drop builder with data source selection and preview.
- Supported entities: Products, Projects, Tasks, Subtasks, Agencies, Users, Custom Fields, Audit Events.
- Operations: filter, group by, pivot, aggregation (sum, avg, count, min, max), calculated fields, time series.
- Visualizations: tables, bar charts, line charts, pie charts, stacked bars, KPI cards.
- Templates: save, clone, share (by role/team); reusable by others.

### Exports & Scheduling
- Export report results to CSV, XLSX, or PDF.
- Support download directly from UI and backend email attachments.
- Scheduling engine (CRON-like) for email delivery via Outlook/Graph integration.
- Scheduled reports respect user’s RBAC at time of execution.

### Role-Based Access
- Report creation/editing limited to Admins, Managers, and Contributors.
- View-only access for External Agencies (filtered data only).
- Report sharing options: individual users, teams, agencies, public (internal only).

### Performance & Query Handling
- Asynchronous query execution with progress indicator.
- Long-running queries processed via background worker.
- Query timeout at 60 seconds; retry once.
- Results cached in Supabase (Redis-backed or Postgres materialized views).

### Dashboards & Embedding
- Users can pin saved reports to dashboards.
- Interactive dashboard mode with live refresh and filters.
- Share dashboard links internally; permissions enforced.

## Non-Functional Requirements
- p95 query execution < 5 seconds for typical datasets.
- Async query results for large reports (up to 100k rows).
- Exports to XLSX limited to 25k rows; CSV up to 100k rows.
- PDF generation under 10s via serverless rendering.
- Responsive and mobile-friendly UI for viewing dashboards.
- Reports cached for 24 hours to reduce load.

## Technical Stack
- **Backend:** Node.js (Express) using Supabase Postgres as primary data source.
- **Data Layer:** SQL generator with role-based filters injected before query execution.
- **Caching:** Redis for query results and schedule states.
- **Worker Queue:** BullMQ for async report processing and email scheduling.
- **Exports:** XLSX via SheetJS, CSV native, PDF via Puppeteer (Chromium headless).
- **Email Delivery:** Microsoft 365 SMTP/Graph.
- **Frontend (PRD02 dependency):** Nuxt 3 + Vue charts (Chart.js or ApexCharts).

## Dependencies
- Internal: PRD01 (DB schema, RBAC, audit logs), PRD02 (frontend embedding), PRD04 (automation hooks).
- External: Supabase, Outlook/Graph, Redis.

## Milestones & Deliverables
| Phase | Deliverable | Owner | Est. Duration | Dependency |
|------|-------------|-------|---------------|------------|
| 1 | Report query service with RBAC filter injection | Backend | 6d | PRD01 |
| 2 | Visual builder UI with charts and filters | Frontend | 8d | 1 |
| 3 | Export engine (CSV/XLSX/PDF) | Backend | 5d | 2 |
| 4 | Scheduler with Outlook email delivery | Backend | 3d | 3 |
| 5 | Dashboard embedding and pinning | Frontend | 4d | 2 |

## Acceptance Criteria
- [ ] Users can build, save, and share reports with role-based visibility.
- [ ] Reports query only authorized data per user RBAC.
- [ ] Exports (CSV, XLSX, PDF) generate successfully and match report data.
- [ ] Scheduled reports send correctly via Outlook with attachments.
- [ ] Dashboards load <2s average; widgets update on interval.
- [ ] Large queries (>5s) handled asynchronously with progress feedback.

## Risks & Mitigations
- Risk: Query load spikes due to report complexity → Mitigation: async jobs and caching.
- Risk: Data exposure in shared links → Mitigation: enforce tokenized, RBAC-verified endpoints.
- Risk: Outlook email limits → Mitigation: staggered job scheduling + retry queue.
- Risk: Heavy rendering load for PDF → Mitigation: queue-based batch rendering.

## Success Metrics
- ≥80% of internal reports built without dev assistance.
- <5 minutes average time to first complete report.
- ≥95% scheduled reports delivered successfully.
- Query performance p95 < 5s for 90% of cases.
