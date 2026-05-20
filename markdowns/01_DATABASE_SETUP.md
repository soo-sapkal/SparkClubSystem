# Phase 1 — Database Setup

## Goal
Create the SQLite database schema and seed it with realistic sample data. This produces `schema.sql` — the single file an agent or developer seeds to get a ready database.

---

## Step 1.1 — Install Dependencies

```bash
mkdir -p sparkclub/backend/db
cd sparkclub/backend
npm init -y
npm install better-sqlite3
```

---

## Step 1.2 — Create `backend/db/schema.sql`

This file is the **single source of truth**. Create it now and it will be appended to in later phases as needed. Copy this entire block exactly:

```sql
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
  club_id      INTEGER NOT NULL REFERENCES clubs(id),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role         TEXT NOT NULL CHECK(role IN ('treasurer','member','admin')) DEFAULT 'member',
  avatar_initials TEXT,
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
INSERT OR IGNORE INTO users (id, club_id, name, email, password_hash, role, avatar_initials) VALUES
  (1, 1, 'Arjun Mehta',    'arjun@sparkclub.edu',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'treasurer', 'AM'),
  (2, 1, 'Priya Sharma',   'priya@sparkclub.edu',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',     'PS'),
  (3, 1, 'Rahul Joshi',    'rahul@sparkclub.edu',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member',    'RJ'),
  (4, 1, 'Sneha Patil',    'sneha@sparkclub.edu',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member',    'SP'),
  (5, 1, 'Dev Kulkarni',   'dev@sparkclub.edu',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member',    'DK');

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
```

---

## Step 1.3 — Create `backend/db/database.js`

```javascript
// backend/db/database.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'sparkclub.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDb() {
  const database = getDb();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // SQLite doesn't support multi-statement exec via prepare,
  // but better-sqlite3's exec() handles it.
  database.exec(schema);
  console.log('✅ Database initialized from schema.sql');
  return database;
}

module.exports = { getDb, initializeDb };
```

---

## Step 1.4 — Verify the Schema Works

```bash
cd sparkclub/backend
node -e "
const { initializeDb } = require('./db/database');
const db = initializeDb();
const clubs = db.prepare('SELECT * FROM clubs').all();
const users = db.prepare('SELECT id, name, role FROM users').all();
const txCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get();
console.log('Clubs:', clubs);
console.log('Users:', users);
console.log('Transactions seeded:', txCount.c);
"
```

**Expected output:**
```
✅ Database initialized from schema.sql
Clubs: [ { id: 1, name: 'SparkClub', ... } ]
Users: [ { id: 1, name: 'Arjun Mehta', role: 'treasurer' }, ... ]
Transactions seeded: 28
```

---

## Checkpoint ✅
After this phase:
- `backend/db/sparkclub.db` exists and is seeded
- `schema.sql` is the portable seed file (commit this, gitignore `.db`)
- `database.js` exports `getDb()` and `initializeDb()`
- No errors running the verify command

**Add to `backend/.gitignore`:**
```
node_modules/
db/sparkclub.db
.env
```
