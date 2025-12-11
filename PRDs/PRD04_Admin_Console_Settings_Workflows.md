# PRD04 – Admin Console, Settings & Advanced Workflows (Cursor + Supabase)

## Overview
Implements the Admin Console and advanced workflow management for the project management system. This module enables global configuration of statuses, labels, custom fields, automations (IFTTT), approval flows, and audit visibility. It leverages Supabase for storage and permissions, and is designed to work seamlessly with the Cursor environment and the Vibe-based architecture defined in prior PRDs.

## Objectives
- Provide a secure, centralized admin interface for managing global system settings.
- Enable Admins and Managers to define and control workflow automations and approvals.
- Deliver a visual automation builder (if-this-then-that logic).
- Manage audit logs, email configurations, and organizational preferences (dark mode, defaults).

## Functional Requirements
### Global Settings
- Manage global **Statuses** and **Labels** (color-coded).
- Manage **Custom Fields** (global library with internal-only toggle).
- Manage **SLA settings**, **WIP limits**, and **task templates**.
- All configuration changes must be audited with timestamp and actor.

### Automation Builder (IFTTT)
- Visual rule builder with trigger-condition-action model.
- **Triggers**: task created, updated, status changed, due soon, SLA breached, comment added, approval completed.
- **Conditions**: field values, roles, team, agency, labels, or product/project association.
- **Actions**: change status/assignee/labels, send email, add watcher, create subtask, trigger approval, or log audit entry.
- Rule versioning and enable/disable toggles.
- Test mode for automation validation before activation.

### Approval Flow Designer
- Define multi-step approval workflows (sequential or parallel).
- Assign approvers by role/team/agency.
- Approvals can block status transitions or visibility until completion.
- Approval outcomes (approve/reject) trigger automations or status changes.

### Email & Integration Settings
- Configure Outlook SMTP or Microsoft Graph credentials.
- Manage default “from” address, reply-to, and email templates for notifications.
- Option to test email connection before saving.

### Audit & Compliance
- View audit logs (filter by actor, entity, or date range).
- Export audit history as CSV (Admins only).
- Log all automation runs, rule changes, and workflow edits.

### Usage Analytics (Optional)
- Toggle to enable internal analytics tracking (optional post-MVP).
- Track configuration usage, automation frequency, and user adoption.

## Non-Functional Requirements
- Restricted to Owner/Admin roles for write access.
- Manager role can view and manage automations within their teams.
- All settings changes must generate audit logs (Supabase triggers).
- API response <300 ms p95 for standard operations.
- Concurrent rule execution isolation via queue locks.

## Technical Stack
- **Frontend:** Nuxt 3 (Vue 3) in Cursor, using TailwindCSS and Vibe UI components.
- **Backend:** Node.js (Express) integrated with Supabase REST APIs and Supabase Functions for triggers.
- **Database:** Supabase Postgres (global config tables: statuses, labels, custom_fields, automations, approvals, audit_logs).
- **Queue:** BullMQ (Redis) for automation execution and audit event processing.
- **Email:** Microsoft Graph API or Outlook SMTP.
- **Auth & RBAC:** Supabase Auth + role claims from PRD01 definitions.

## Dependencies
- Internal: PRD01 (RBAC, automations runtime, audit schema), PRD02 (settings UI embedding), PRD03 (report exports).
- External: Supabase, Redis, Microsoft Graph or SMTP.

## Milestones & Deliverables
| Phase | Deliverable | Owner | Est. Duration | Dependency |
|------|-------------|-------|---------------|------------|
| 1 | Settings shell (statuses, labels, dark mode, defaults) | Frontend | 4d | PRD01 |
| 2 | Custom field library (global + internal-only flag) | Frontend | 5d | 1 |
| 3 | Automation builder (visual editor) | Full-stack | 8d | PRD01 automations |
| 4 | Approval designer (sequential/parallel flow builder) | Full-stack | 5d | 3 |
| 5 | Audit & email configuration views | Frontend | 4d | 3 |

## Acceptance Criteria
- [ ] Admins can add/edit statuses, labels (with color), and manage defaults.
- [ ] Custom fields support all types from PRD01; internal-only toggle respected.
- [ ] Automation rules can be created, tested, and toggled on/off.
- [ ] Approval workflows enforce multi-step validation and integrate with Task statuses.
- [ ] Email configuration tested and saved securely in Supabase secrets.
- [ ] Audit log captures every configuration change with timestamp and actor.
- [ ] Export audit log to CSV works correctly for Admins.

## Risks & Mitigations
- Risk: Automation loops or recursion → Mitigation: loop detection and execution limits.
- Risk: Complex UI for automation builder → Mitigation: preset templates + guided wizard.
- Risk: Email misconfiguration → Mitigation: test connection + error feedback.
- Risk: Large audit tables → Mitigation: partitioning and periodic archiving via Supabase functions.

## Success Metrics
- <15 minutes for Admins to model a new workflow (status + fields + automation).
- 0 configuration changes without audit record.
- 95% of automation rules execute successfully without manual retries.
- p95 API response time under 300 ms for config endpoints.

