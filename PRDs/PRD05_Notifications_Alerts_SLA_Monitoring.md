# PRD05 – Notifications, Alerts & SLA Monitoring (Cursor + Supabase)

## Overview
This PRD defines the **Notifications and SLA Monitoring System** for the project management tool. It manages user notifications (email, in-app future), automated alerts, and SLA reminders across Products, Projects, and Tasks. It integrates with Supabase for event storage and Outlook SMTP for delivery, and hooks into the Automations and Approvals systems defined in PRD04.

## Objectives
- Deliver robust, role-based notification infrastructure with configurable alerts.
- Provide SLA breach detection, due-date reminders, and escalation rules.
- Ensure email notifications are reliable, tracked, and auditable.
- Future-ready for real-time (WebSocket or Supabase channel) notifications.

## Functional Requirements

### Notification Triggers
Notifications can be triggered by the following events (all configurable via PRD04 Automations):
- Task or subtask assigned / reassigned
- Status change or field update
- Due date approaching or SLA breach
- Comment added with @mention
- Approval step completed or rejected
- Watcher subscribed item updated
- Automation rule explicitly invokes `send_notification` action

Each event type must include payload details: actor, entity type, entity ID, timestamp, and message context.

### Notification Types
- **Email (MVP)** – Sent via Outlook SMTP / Microsoft Graph API.
- **In-App (Future)** – Displayed via notification bell and badge (real-time through Supabase channels).
- **Digest Mode (Future)** – Scheduled summary emails per user preference.

### SLA Monitoring
- SLA rules configurable globally (in PRD04 settings) with thresholds in hours/days.
- SLA events:
  - **Due Soon**: within X hours before due date.
  - **Overdue**: past due date.
  - **Breached**: SLA-specific condition not met (e.g., unassigned for >24h).
- SLA evaluator runs every 15 minutes via Supabase Edge Function or worker.
- Alerts generated for responsible users, watchers, and managers.

### Alert Rules & Customization
- Admins can define alert templates (name, trigger, recipients, email subject/body).
- Templates stored in Supabase table: `alert_templates`.
- Recipients can include:
  - Direct assignee
  - Watchers
  - Specific roles or teams
  - Agencies tagged on the item
- Email content supports template variables: `{{task.title}}`, `{{project.name}}`, `{{actor.name}}`, `{{due_date}}`.

### Email Delivery & Tracking
- Outgoing messages queued through Redis/BullMQ for reliability.
- Retry policy: up to 3 retries with exponential backoff.
- Delivery outcomes stored in `notification_logs` table with fields:
  - `id`, `recipient`, `trigger`, `status`, `timestamp`, `retries`, `error_message`
- Failed deliveries trigger alert to Admin if >5% over 1 hour.

### Notification Preferences
- Each user can toggle categories:
  - Assignment changes
  - Mentions
  - SLA alerts
  - Approval changes
  - Automation results
- Preferences stored in `user_notification_settings` table.

## Non-Functional Requirements
- p95 notification latency < 5s for single-event emails.
- SLA evaluation frequency: every 15 minutes.
- Notification delivery success rate ≥ 99%.
- Queue resilience: process recovery under 30s on failure.
- Email rate limit: max 30 per minute per org to avoid throttling.

## Technical Stack
- **Backend:** Node.js (Express) running inside Cursor workspace.
- **Database:** Supabase Postgres (`notifications`, `alert_templates`, `notification_logs`, `user_notification_settings`).
- **Queue:** BullMQ (Redis) for email queuing and SLA evaluation tasks.
- **Email:** Microsoft 365 SMTP or Graph API integration.
- **Scheduler:** Supabase Edge Function (cron) triggers SLA evaluator and digest jobs.
- **Integration Points:**
  - PRD01 (Tasks, Users, Agencies for context)
  - PRD04 (Automation engine to emit notification triggers)

## Dependencies
- Internal: PRD01 (task data), PRD04 (automation events, SLA rules).
- External: Outlook SMTP / Graph, Supabase, Redis.

## Milestones & Deliverables
| Phase | Deliverable | Owner | Est. Duration | Dependency |
|------|-------------|-------|---------------|------------|
| 1 | Notification schema & email templates | Backend | 3d | PRD01 |
| 2 | Email queue and Outlook integration | Backend | 3d | 1 |
| 3 | Notification service (send + log) | Backend | 3d | 2 |
| 4 | SLA evaluator & alert generator | Backend | 5d | PRD04 |
| 5 | User notification settings endpoints | Backend | 2d | 3 |
| 6 | Test scripts & delivery validation | Backend | 2d | 4 |

## Acceptance Criteria
- [ ] Email notifications sent for all defined triggers.
- [ ] Notification logs include accurate delivery status and timestamps.
- [ ] SLA alerts fire correctly for “Due Soon” and “Overdue” cases.
- [ ] Failed email retry logic works and is logged.
- [ ] Notification preferences respected per user.
- [ ] All triggered events auditable through `notification_logs` table.
- [ ] System can recover queued messages after restart without duplication.

## Risks & Mitigations
- Risk: Outlook throttling → Mitigation: per-org rate limit + backoff queue.
- Risk: Notification flood for mass updates → Mitigation: batching/deduplication per recipient per minute.
- Risk: Missed SLA checks → Mitigation: monitoring via Supabase cron logs and alerts.
- Risk: Template variable errors → Mitigation: runtime validation before send.

## Success Metrics
- 99% email delivery rate within 5 seconds average latency.
- 0 duplicate or missed notifications across tested event types.
- SLA evaluator accuracy > 99% (compared to manual audit).
- <1% of alerts fail to send over 24 hours.

