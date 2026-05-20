# SparkClub Documentation Portal

Welcome to the SparkClub Documentation Portal. SparkClub is a multi-tenant ERP platform designed specifically for college club management, financial governance, event tracking, and student development tracking, enhanced by AI capabilities.

## Document Directory Map

### 🏛️ [Architecture](./architecture/system-overview.md)
* [System Overview](./architecture/system-overview.md) - Core components and 3-layer architecture.
* [Architecture Diagrams](./architecture/architecture-diagrams.md) - Mermaid visual flow and sequence diagrams.
* [Database Design](./architecture/database-design.md) - SQLite relational model and indexes.
* [Multi-Tenant Model](./architecture/multi-tenant-model.md) - Scoping, isolation, and data policies.
* [Auth & RBAC](./architecture/auth-rbac.md) - JWT validation and roles matrix.
* [Workflow Engine](./architecture/workflow-engine.md) - Request lifecycle and transition logic.
* [AI Architecture](./architecture/ai-architecture.md) - Claude integration, prompts, and storage.
* [Integrations](./architecture/integrations.md) - Exporters, exports structure, and APIs.

### 📦 [Product](./product/product-overview.md)
* [Product Overview](./product/product-overview.md) - SparkClub value proposition and core pillars.
* [User Roles](./product/user-roles.md) - Brief scope of permission groups.
* [Club Head Guide](./product/club-head.md) - Governance, event management, and team tracking.
* [Treasurer Guide](./product/treasurer.md) - Transaction logging, category budgets, and audits.
* [Faculty Coordinator Guide](./product/faculty-coordinator.md) - Institutional oversight, approvals, and compliance.
* [Student Member Guide](./product/student-member.md) - Reimbursements, events, and performance tracking.
* [Super Admin Guide](./product/super-admin.md) - Platform configuration, tenants, security, and bulk operations.

### 🔧 [Features](./features/financial-management.md)
* [Financial Management](./features/financial-management.md) - Allocations, budgets, and ledger.
* [Reimbursement System](./features/reimbursement-system.md) - Claim workflows, receipts validation, and payouts.
* [Sponsorship Management](./features/sponsorship-management.md) - Pipelines, CRM stages, and closed deals.
* [Event Management](./features/event-management.md) - Proposals, RSVPs, turnout, and task tracking.
* [Student Development](./features/student-development.md) - Merit indicators, travel grants, and certificates.
* [Communication System](./features/communication-system.md) - Messages, notifications, alerts, and templates.
* [Analytics & Reporting](./features/analytics.md) - Recharts views, export formatting.
* [Audit & Compliance](./features/audit-compliance.md) - Logs, fraud indicators, policy checks.
* [AI Assistant](./features/ai-assistant.md) - Interactive assistant, tips, and prompt details.
* [Document Management](./features/document-management.md) - Bill uploads, MoU archives, version control.
* [Notification System](./features/notification-system.md) - Triggers, SLAs, and escalation hierarchies.

### 💻 [Developer Guide](./developer/setup.md)
* [Setup & Installation](./developer/setup.md) - Bootstrapping instructions.
* [Local Development](./developer/local-development.md) - Running dev servers, DB seeding.
* [Environment Variables](./developer/environment-variables.md) - Dev and prod configurations.
* [API Reference](./developer/api-reference.md) - JSON API endpoint specifications.
* [Backend Structure](./developer/backend-structure.md) - Express code layout.
* [Frontend Structure](./developer/frontend-structure.md) - React/Vite file layout.
* [Coding Standards](./developer/coding-standards.md) - Guidelines and conventions.
* [Deployment](./developer/deployment.md) - Render, Vercel, and migration scripts.
* [Testing](./developer/testing.md) - Test methodologies and tools.
* [Troubleshooting](./developer/troubleshooting.md) - Common issues and fixes.

### ⚙️ [Operations](./operations/backups.md)
* [Backups](./operations/backups.md) - Database dump strategies and cron setups.
* [Monitoring](./operations/monitoring.md) - Logging patterns, uptime checks.
* [Incident Response](./operations/incident-response.md) - Security breach protocols, system lock downs.
* [Maintenance](./operations/maintenance.md) - WAL mode management, vacuuming databases.
* [Scaling](./operations/scaling.md) - Moving to PostgreSQL, clustering options.
