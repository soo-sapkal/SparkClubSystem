-- ============================================================
-- SparkClub Database Schema + Seed Data
-- Compatible with: SQLite 3.x
-- Run: sqlite3 sparkclub.db < schema.sql
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS clubs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id      INTEGER REFERENCES clubs(id),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role         TEXT NOT NULL CHECK(role IN ('club_head','treasurer','member','admin','faculty','super_admin')) DEFAULT 'member',
  avatar_initials TEXT,
  prn          TEXT,
  blood_group TEXT,
  batch        TEXT,
  department   TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budget_categories (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id  INTEGER NOT NULL REFERENCES clubs(id),
  name     TEXT NOT NULL,
  color    TEXT DEFAULT '#6366f1',
  icon     TEXT DEFAULT '💰'
);

CREATE TABLE IF NOT EXISTS budgets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id       INTEGER NOT NULL REFERENCES clubs(id),
  category_id   INTEGER NOT NULL REFERENCES budget_categories(id),
  fiscal_year   INTEGER NOT NULL,
  month         INTEGER,          -- NULL = annual budget
  allocated     REAL NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id       INTEGER NOT NULL REFERENCES clubs(id),
  category_id   INTEGER REFERENCES budget_categories(id),
  type          TEXT NOT NULL CHECK(type IN ('income','expense')),
  amount        REAL NOT NULL,
  description   TEXT NOT NULL,
  reference     TEXT,             -- receipt/invoice number
  date          TEXT NOT NULL,    -- ISO date YYYY-MM-DD
  recorded_by   INTEGER REFERENCES users(id),
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS funding_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id       INTEGER NOT NULL REFERENCES clubs(id),
  requested_by  INTEGER NOT NULL REFERENCES users(id),
  reviewed_by   INTEGER REFERENCES users(id),
  category_id   INTEGER REFERENCES budget_categories(id),
  title         TEXT NOT NULL,
  description   TEXT,
  amount        REAL NOT NULL,
  status        TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','under_review')) DEFAULT 'pending',
  priority      TEXT CHECK(priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  event_date    TEXT,             -- related event date if any
  reviewer_note TEXT,
  submitted_at  TEXT DEFAULT (datetime('now')),
  reviewed_at   TEXT
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id    INTEGER NOT NULL REFERENCES clubs(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  role       TEXT NOT NULL CHECK(role IN ('user','assistant')),
  content    TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- CLUB HEAD DASHBOARD TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id    INTEGER NOT NULL REFERENCES clubs(id),
  name       TEXT NOT NULL,
  description TEXT,
  head_user_id INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS team_members (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id      INTEGER NOT NULL REFERENCES clubs(id),
  user_id      INTEGER NOT NULL REFERENCES users(id),
  position     TEXT NOT NULL CHECK(position IN ('president','vice_president','treasurer','event_lead','technical_lead','sponsorship_lead','marketing_lead','design_lead','core_member','volunteer')),
  department_id INTEGER REFERENCES departments(id),
  contribution_score REAL DEFAULT 0,
  is_active    INTEGER DEFAULT 1,
  joined_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id           INTEGER NOT NULL REFERENCES clubs(id),
  name             TEXT NOT NULL,
  description       TEXT,
  event_type        TEXT CHECK(event_type IN ('hackathon','workshop','seminar','cultural','sports','other')),
  status           TEXT DEFAULT 'planning' CHECK(status IN ('planning','active','completed','cancelled')),
  start_date        TEXT,
  end_date          TEXT,
  venue             TEXT,
  coordinator_id    INTEGER REFERENCES users(id),
  budget_allocated  REAL DEFAULT 0,
  budget_used       REAL DEFAULT 0,
  expected_turnout  INTEGER,
  actual_turnout    INTEGER DEFAULT 0,
  revenue_generated REAL DEFAULT 0,
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id   INTEGER NOT NULL REFERENCES events(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  registered_at TEXT DEFAULT (datetime('now')),
  attended   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id       INTEGER NOT NULL REFERENCES clubs(id),
  event_id      INTEGER REFERENCES events(id),
  title         TEXT NOT NULL,
  description   TEXT,
  assigned_to   INTEGER REFERENCES users(id),
  status        TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','blocked','review','completed')),
  priority      TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  deadline      TEXT,
  created_by    INTEGER REFERENCES users(id),
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sponsors (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id       INTEGER NOT NULL REFERENCES clubs(id),
  company_name  TEXT NOT NULL,
  contact_name  TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  tier          TEXT CHECK(tier IN ('platinum','gold','silver','bronze')),
  total_value   REAL DEFAULT 0,
  notes         TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sponsor_pipeline (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id         INTEGER NOT NULL REFERENCES clubs(id),
  sponsor_id      INTEGER REFERENCES sponsors(id),
  stage           TEXT DEFAULT 'prospect' CHECK(stage IN ('prospect','contacted','meeting_scheduled','proposal_sent','negotiation','confirmed','closed_lost')),
  expected_value  REAL DEFAULT 0,
  closed_value    REAL DEFAULT 0,
  follow_up_date  TEXT,
  notes           TEXT,
  last_interaction TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_dev_requests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id         INTEGER NOT NULL REFERENCES clubs(id),
  requested_by    INTEGER NOT NULL REFERENCES users(id),
  reviewed_by     INTEGER REFERENCES users(id),
  request_type    TEXT NOT NULL CHECK(request_type IN ('hackathon_funding','travel_grant','workshop_cert','mentorship','project_showcase')),
  title           TEXT NOT NULL,
  description     TEXT,
  amount          REAL DEFAULT 0,
  event_name      TEXT,
  event_date      TEXT,
  status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','revision_requested')),
  reviewer_note   TEXT,
  submitted_at    TEXT DEFAULT (datetime('now')),
  reviewed_at     TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id       INTEGER NOT NULL REFERENCES clubs(id),
  uploaded_by   INTEGER NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  doc_type      TEXT CHECK(doc_type IN ('bill','invoice','approval_letter','sponsorship_proposal','event_permission','meeting_minutes','certificate','vendor_quotation','other')),
  file_url      TEXT,
  tags          TEXT,
  version       INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id       INTEGER NOT NULL REFERENCES clubs(id),
  user_id       INTEGER NOT NULL REFERENCES users(id),
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     INTEGER,
  details       TEXT,
  ip_address    TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_club    ON transactions(club_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_type    ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_club_year    ON budgets(club_id, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_funding_club_status  ON funding_requests(club_id, status);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Club
INSERT OR IGNORE INTO clubs (id, name, description) VALUES
  (1, 'SparkClub', 'Student innovation and development club at MIT College of Engineering');

-- Users (passwords are bcrypt hash of 'password123')
INSERT OR IGNORE INTO users (id, club_id, name, email, password_hash, role, avatar_initials, prn, blood_group, batch, department) VALUES
  (1, 1, 'Arjun Mehta',    'arjun@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'treasurer', 'AM', 'MITU2023001', 'A+', '2023-2027', 'Computer Engineering'),
  (2, 1, 'Priya Sharma',   'priya@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'admin',     'PS', 'MITU2023002', 'O+', '2023-2027', 'Computer Engineering'),
  (3, 1, 'Rahul Joshi',    'rahul@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'member',    'RJ', 'MITU2023003', 'B+', '2023-2027', 'Information Technology'),
  (4, 1, 'Sneha Patil',    'sneha@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'member',    'SP', 'MITU2023004', 'AB+', '2023-2027', 'Computer Engineering'),
  (5, 1, 'Dev Kulkarni',   'dev@sparkclub.edu',     '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'member',    'DK', 'MITU2023005', 'A-', '2023-2027', 'Electronics'),
  (6, 1, 'Aanya Iyer',    'aanya@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'club_head', 'AI', 'MITU2022001', 'O+', '2022-2026', 'Computer Engineering'),
  (7, 1, 'Rohan Desai',   'rohan@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'member',    'RD', 'MITU2023006', 'B-', '2023-2027', 'Information Technology'),
  (8, 1, 'Meera Nair',    'meera@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'member',    'MN', 'MITU2023007', 'A+', '2023-2027', 'Computer Engineering'),
  (9, 1, 'Karan Shah',    'karan@sparkclub.edu',   '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'member',    'KS', 'MITU2023008', 'O-', '2023-2027', 'Electronics'),
  (10, 1, 'Dr. Smitha Rao', 'smitha@faculty.edu',    '$2b$10$n190w6KHGGI3vdW9nNvsHuvo9z9fxh22u2vggTVKBkQeHjVpiZP.6', 'faculty',   'SR', NULL, NULL, NULL, 'Faculty'),
  (11, NULL, 'Super Admin', 'admin@sparkclub.edu',   '$2b$10$wcpkzYZsmB/0PWu32121j.VEpx3fOtz80U9Xl6A2zhRb6VBsUjSF2', 'super_admin', 'SA', NULL, NULL, NULL, 'Platform Admin');

-- Budget Categories
INSERT OR IGNORE INTO budget_categories (id, club_id, name, color, icon) VALUES
  (1, 1, 'Events & Workshops',  '#6366f1', '🎪'),
  (2, 1, 'Hackathons',          '#f59e0b', '💻'),
  (3, 1, 'Equipment & Tools',   '#10b981', '🛠️'),
  (4, 1, 'Marketing & Outreach','#ef4444', '📣'),
  (5, 1, 'Travel & Transport',  '#3b82f6', '✈️'),
  (6, 1, 'Refreshments',        '#ec4899', '🍕'),
  (7, 1, 'Miscellaneous',       '#8b5cf6', '📦'),
  (8, 1, 'Sponsorship Income',  '#14b8a6', '🤝');

-- Annual Budgets (FY 2025)
INSERT OR IGNORE INTO budgets (id, club_id, category_id, fiscal_year, allocated, notes) VALUES
  (1, 1, 1, 2025, 25000, 'Annual events and workshop budget'),
  (2, 1, 2, 2025, 40000, 'Hackathon registrations and prizes'),
  (3, 1, 3, 2025, 15000, 'Equipment purchases and rentals'),
  (4, 1, 4, 2025, 8000,  'Social media, posters, promotions'),
  (5, 1, 5, 2025, 12000, 'Travel to inter-college events'),
  (6, 1, 6, 2025, 6000,  'Snacks and meals for events'),
  (7, 1, 7, 2025, 4000,  'Miscellaneous club expenses');

-- Transactions (realistic 2025 data)
INSERT OR IGNORE INTO transactions (id, club_id, category_id, type, amount, description, reference, date, recorded_by) VALUES
  -- Income
  (1,  1, 8, 'income', 50000, 'Annual sponsorship - TechCorp India',     'SPONS-001', '2025-01-05', 1),
  (2,  1, 8, 'income', 15000, 'Workshop registration fees - Jan batch',  'REG-JAN01', '2025-01-20', 1),
  (3,  1, 8, 'income', 8000,  'Hackathon entry fees - HackSpark 2025',   'HACK-001',  '2025-02-10', 1),
  (4,  1, 8, 'income', 20000, 'College grant - Q1 2025',                 'GRANT-Q1',  '2025-03-01', 2),
  (5,  1, 8, 'income', 12000, 'Workshop registration fees - Mar batch',  'REG-MAR01', '2025-03-15', 1),
  (6,  1, 8, 'income', 5000,  'Merchandise sales',                       'MERCH-001', '2025-04-05', 3),
  (7,  1, 8, 'income', 18000, 'Mid-year sponsorship - StartupHub',       'SPONS-002', '2025-06-01', 1),
  (8,  1, 8, 'income', 10000, 'College grant - Q2 2025',                 'GRANT-Q2',  '2025-07-01', 2),
  -- Expenses
  (9,  1, 1, 'expense', 4500, 'Venue booking - Annual Kickoff event',    'VENUE-001', '2025-01-12', 1),
  (10, 1, 6, 'expense', 1800, 'Refreshments - Kickoff event',            'FOOD-001',  '2025-01-12', 1),
  (11, 1, 4, 'expense', 2000, 'Poster printing and banners - Jan',       'PRINT-001', '2025-01-18', 4),
  (12, 1, 2, 'expense', 8000, 'HackSpark 2025 - prize money',            'PRIZE-001', '2025-02-15', 1),
  (13, 1, 2, 'expense', 3500, 'HackSpark 2025 - refreshments',           'FOOD-002',  '2025-02-15', 1),
  (14, 1, 3, 'expense', 6200, 'Raspberry Pi kits x10 for workshops',     'EQUIP-001', '2025-02-20', 1),
  (15, 1, 5, 'expense', 4800, 'Travel - National Techfest Mumbai',       'TRAVEL-001','2025-03-08', 1),
  (16, 1, 1, 'expense', 3200, 'Speaker fees - ML Workshop',              'SPEAK-001', '2025-03-22', 1),
  (17, 1, 6, 'expense', 900,  'Refreshments - ML Workshop',              'FOOD-003',  '2025-03-22', 3),
  (18, 1, 4, 'expense', 1500, 'Social media ads - April campaign',       'ADS-001',   '2025-04-10', 4),
  (19, 1, 1, 'expense', 5500, 'Venue + setup - Design Bootcamp',         'VENUE-002', '2025-04-25', 1),
  (20, 1, 7, 'expense', 750,  'Stationery and office supplies',          'MISC-001',  '2025-05-03', 3),
  (21, 1, 2, 'expense', 12000,'CodeWar Hackathon - registration x6',     'HACK-002',  '2025-05-18', 1),
  (22, 1, 3, 'expense', 3800, 'Arduino starter kits x8',                 'EQUIP-002', '2025-05-25', 1),
  (23, 1, 5, 'expense', 3200, 'Travel - Inter-college Ideathon Nashik',  'TRAVEL-002','2025-06-14', 1),
  (24, 1, 6, 'expense', 1200, 'Refreshments - End of sem party',         'FOOD-004',  '2025-06-28', 3),
  (25, 1, 1, 'expense', 2800, 'Venue - Orientation for new members',     'VENUE-003', '2025-07-20', 1),
  (26, 1, 4, 'expense', 900,  'Poster design - freelancer',              'DESIGN-001','2025-07-22', 4),
  (27, 1, 2, 'expense', 6000, 'Smart India Hackathon - prep expenses',   'SIH-001',   '2025-08-10', 1),
  (28, 1, 7, 'expense', 400,  'Miscellaneous - club admin',              'MISC-002',  '2025-08-20', 1);

-- Funding Requests
INSERT OR IGNORE INTO funding_requests
  (id, club_id, requested_by, reviewed_by, category_id, title, description, amount, status, priority, event_date, reviewer_note, submitted_at, reviewed_at)
VALUES
  (1, 1, 3, 1, 2, 'HackVerse 2025 Participation',
   'Request for team registration and travel to HackVerse national hackathon in Bangalore. Team of 4 members.',
   18000, 'approved', 'high', '2025-09-20',
   'Approved. Ensure receipts for all expenses are submitted within 5 days of return.',
   '2025-08-25', '2025-08-27'),

  (2, 1, 4, NULL, 1, 'UI/UX Design Workshop - External Speaker',
   'Bring in a senior UX designer from Pune for a full-day hands-on workshop for 40 students.',
   12000, 'under_review', 'medium', '2025-10-05',
   NULL, '2025-09-01', NULL),

  (3, 1, 3, 1, 5, 'TechSymposium SPPU - Travel Grant',
   'Travel and accommodation for 3 members presenting research paper at Savitribai Phule Pune University.',
   9500, 'approved', 'medium', '2025-09-15',
   'Approved for 3 members. Book train tickets in advance.',
   '2025-08-20', '2025-08-22'),

  (4, 1, 5, 1, 3, 'VR Headset for Demo Lab',
   'Purchase 2 Meta Quest 3 headsets for the innovation lab to demonstrate VR applications to students.',
   55000, 'rejected', 'low', NULL,
   'Budget insufficient for FY2025. Suggested to re-apply in next fiscal year.',
   '2025-07-10', '2025-07-15'),

  (5, 1, 4, NULL, 4, 'Social Media Campaign - Semester Launch',
   'Paid promotions on Instagram and LinkedIn to boost club visibility and member recruitment.',
   3500, 'pending', 'medium', '2025-09-10',
   NULL, '2025-09-02', NULL),

(6, 1, 3, NULL, 2, 'Smart India Hackathon 2025 - Finals',
    'Our team qualified for SIH finals in Delhi. Need sponsorship for travel, accommodation (3 nights) for 6 members.',
    42000, 'pending', 'urgent', '2025-10-18',
    NULL, '2025-09-05', NULL);

-- Departments
INSERT OR IGNORE INTO departments (id, club_id, name, description, head_user_id) VALUES
  (1, 1, 'Technical',    'Software, hardware, and tech initiatives', 3),
  (2, 1, 'Events',       'Event planning and execution', 7),
  (3, 1, 'Sponsorship', 'Fundraising and sponsor relations', 8),
  (4, 1, 'Marketing',    'Outreach and public relations', 4),
  (5, 1, 'Design',       'Visual and UI/UX design', 9);

-- Team Members
INSERT OR IGNORE INTO team_members (id, club_id, user_id, position, department_id, contribution_score) VALUES
  (1, 1, 6, 'president',        NULL, 95),
  (2, 1, 1, 'treasurer',       NULL, 88),
  (3, 1, 3, 'technical_lead',  1, 82),
  (4, 1, 7, 'event_lead',      2, 76),
  (5, 1, 8, 'sponsorship_lead', 3, 70),
  (6, 1, 4, 'marketing_lead',  4, 65),
  (7, 1, 9, 'design_lead',     5, 60),
  (8, 1, 2, 'vice_president',  NULL, 85),
  (9, 1, 5, 'core_member',     1, 55);

-- Events
INSERT OR IGNORE INTO events (id, club_id, name, description, event_type, status, start_date, end_date, venue, coordinator_id, budget_allocated, budget_used, expected_turnout, actual_turnout, revenue_generated) VALUES
  (1, 1, 'TechFest 2026',   'Annual technical festival with multiple events',  'hackathon',  'active',   '2026-02-15', '2026-02-17', 'MIT Main Campus',       7, 80000, 31200, 500, 410, 25000),
  (2, 1, 'AI Workshop',      'Hands-on workshop on ML and AI fundamentals',    'workshop',   'completed', '2026-01-10', '2026-01-10', 'Computer Lab Block A',  3, 15000, 14800, 80,  75,  12000),
  (3, 1, 'HackSpark 2026',  '24-hour intra-college hackathon',                'hackathon',  'planning', '2026-03-20', '2026-03-21', 'Innovation Hub',         7, 50000, 0,     200, 0,   0),
  (4, 1, 'Design Sprint',   'UI/UX bootcamp with industry mentor',           'workshop',   'active',   '2026-04-05', '2026-04-05', 'Design Studio',          9, 20000, 8500,  60,  55,  8000);

-- Tasks
INSERT OR IGNORE INTO tasks (id, club_id, event_id, title, description, assigned_to, status, priority, deadline) VALUES
  (1, 1, 1, 'Finalize HackSpark venue setup',    'Arrange seating, power, and internet for 200 participants', 7, 'in_progress', 'high',     '2026-03-18'),
  (2, 1, 1, 'Invite sponsors for TechFest',        'Reach out to 5 potential sponsors for Stall/Title sponsorship', 8, 'in_progress', 'urgent',   '2026-02-01'),
  (3, 1, 3, 'Set up judge panel for HackSpark',   'Confirm 4 external judges from industry', 3, 'todo',        'high',     '2026-03-10'),
  (4, 1, 4, 'Print workshop certificates',         'Design and print 60 certificates for participants', 9, 'review',     'medium',   '2026-04-03'),
  (5, 1, NULL, 'Update club website',              'Add new team members and event archives', 3, 'todo',        'low',      '2026-02-20'),
  (6, 1, 1, 'Social media campaign - TechFest',    'Instagram, LinkedIn posts - 3 per week', 4, 'in_progress', 'medium',   '2026-02-14');

-- Sponsors
INSERT OR IGNORE INTO sponsors (id, club_id, company_name, contact_name, contact_email, contact_phone, tier, total_value) VALUES
  (1, 1, 'TechCorp India',    'Rajesh Gupta',    'rajesh@techcorp.in',   '+91-9876543210', 'platinum', 100000),
  (2, 1, 'StartupHub',        'Anita Desai',     'anita@startuphub.io',  '+91-9876543211', 'gold',     50000),
  (3, 1, 'CodeCamp',          'Vikram Singh',    'vikram@codecamp.dev',  '+91-9876543212', 'silver',   25000),
  (4, 1, 'CloudServe',        'Priya Mehta',     'priya@cloudserve.com',  '+91-9876543213', 'bronze',   15000),
  (5, 1, 'DevTools Inc',       'Sanjay Rao',      'sanjay@devtools.io',   '+91-9876543214', 'silver',   30000);

-- Sponsor Pipeline
INSERT OR IGNORE INTO sponsor_pipeline (id, club_id, sponsor_id, stage, expected_value, closed_value, follow_up_date, notes) VALUES
  (1, 1, 1, 'confirmed',    100000, 100000, NULL,              'Platinum sponsor - TechFest Title'),
  (2, 1, 2, 'confirmed',    50000,  50000,  NULL,              'Gold sponsor - Workshops'),
  (3, 1, 3, 'negotiation',  30000,  0,      '2026-01-25',      'Discussing workshop branding'),
  (4, 1, NULL, 'prospect',  75000,  0,      '2026-02-01',      'AI Fest - approached at tech meetup'),
  (5, 1, NULL, 'proposal_sent', 40000, 0,   '2026-01-28',      'EduSoft - proposal sent for TechFest');

-- ============================================================
-- VIEWS (for easy querying)
-- ============================================================

CREATE VIEW IF NOT EXISTS vw_budget_utilization AS
SELECT
  b.id,
  b.club_id,
  bc.name         AS category_name,
  bc.color,
  bc.icon,
  b.fiscal_year,
  b.allocated,
  COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END), 0) AS spent,
  b.allocated - COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END), 0) AS remaining,
  ROUND(
    COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END), 0) * 100.0 / NULLIF(b.allocated, 0),
    1
  ) AS utilization_pct
FROM budgets b
JOIN budget_categories bc ON bc.id = b.category_id
LEFT JOIN transactions t ON t.category_id = b.category_id
  AND t.club_id = b.club_id
  AND strftime('%Y', t.date) = CAST(b.fiscal_year AS TEXT)
GROUP BY b.id;

CREATE VIEW IF NOT EXISTS vw_monthly_summary AS
SELECT
  club_id,
  strftime('%Y', date)  AS year,
  strftime('%m', date)  AS month,
  SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) -
  SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS net
FROM transactions
GROUP BY club_id, year, month;

-- Club Head Executive Dashboard View
CREATE VIEW IF NOT EXISTS vw_executive_dashboard AS
SELECT
  c.id AS club_id,
  (SELECT COALESCE(SUM(allocated),0) FROM budgets WHERE club_id=c.id AND fiscal_year=2026) AS total_annual_budget,
  (SELECT COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) FROM transactions WHERE club_id=c.id AND strftime('%Y','date')='2026') AS total_spent,
  (SELECT COUNT(*) FROM funding_requests WHERE club_id=c.id AND status IN ('pending','under_review')) AS pending_approvals,
  (SELECT COUNT(*) FROM events WHERE club_id=c.id AND status='active') AS active_events,
  (SELECT COUNT(*) FROM events WHERE club_id=c.id AND strftime('%Y-%m', start_date)=strftime('%Y-%m','now')) AS events_this_month,
  (SELECT COALESCE(SUM(revenue_generated),0) FROM events WHERE club_id=c.id) AS total_event_revenue,
  (SELECT COUNT(*) FROM team_members WHERE club_id=c.id AND is_active=1) AS active_members,
  (SELECT COUNT(*) FROM sponsors WHERE club_id=c.id) AS total_sponsors,
  (SELECT COALESCE(SUM(total_value),0) FROM sponsors WHERE club_id=c.id) AS total_sponsor_value,
  (SELECT COUNT(*) FROM sponsor_pipeline WHERE club_id=c.id AND stage='confirmed') AS closed_deals,
  (SELECT COUNT(*) FROM student_dev_requests WHERE club_id=c.id AND status='pending') AS pending_student_requests
FROM clubs c;
