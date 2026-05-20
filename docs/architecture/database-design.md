# Database Design

The persistence layer uses SQLite 3.x configured in WAL (Write-Ahead Logging) mode.

## Schema ERD Summary

### Core Tables
* **clubs**: `id`, `name`, `description`, `created_at`
* **users**: `id`, `club_id`, `name`, `email`, `password_hash`, `role`, `avatar_initials`, `prn`, `blood_group`, `batch`, `department`
* **budget_categories**: `id`, `club_id`, `name`, `color`, `icon`
* **budgets**: `id`, `club_id`, `category_id`, `fiscal_year`, `month`, `allocated`, `notes`
* **transactions**: `id`, `club_id`, `category_id`, `type` (income/expense), `amount`, `description`, `reference`, `date`, `recorded_by`
* **funding_requests**: `id`, `club_id`, `requested_by`, `reviewed_by`, `category_id`, `title`, `description`, `amount`, `status`, `priority`, `event_date`, `reviewer_note`, `submitted_at`, `reviewed_at`
* **events**: `id`, `club_id`, `name`, `description`, `event_type`, `status`, `start_date`, `end_date`, `venue`, `coordinator_id`, `budget_allocated`, `budget_used`, `expected_turnout`, `actual_turnout`, `revenue_generated`
* **tasks**: `id`, `club_id`, `event_id`, `title`, `description`, `assigned_to`, `status`, `priority`, `deadline`
* **sponsors**: `id`, `club_id`, `company_name`, `contact_name`, `contact_email`, `contact_phone`, `tier`, `total_value`
* **sponsor_pipeline**: `id`, `club_id`, `sponsor_id`, `stage`, `expected_value`, `closed_value`, `follow_up_date`
* **audit_logs**: `id`, `club_id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`

## Key Indexes
* `idx_transactions_club` on `transactions(club_id, date)`
* `idx_budgets_club_year` on `budgets(club_id, fiscal_year)`
* `idx_funding_club_status` on `funding_requests(club_id, status)`
