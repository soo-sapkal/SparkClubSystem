# Phase 3 — Backend API Routes

## Goal
Implement all CRUD routes for dashboard, budgets, transactions, funding requests, reports, and AI. Then wire them into `server.js`.

---

## Step 3.1 — `backend/routes/dashboard.js`

```javascript
// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/dashboard — main metrics snapshot
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { club_id } = req.user;
  const year = new Date().getFullYear();

  // Total income this year
  const income = db.prepare(`
    SELECT COALESCE(SUM(amount),0) AS total
    FROM transactions
    WHERE club_id=? AND type='income' AND strftime('%Y',date)=?
  `).get(club_id, String(year));

  // Total expense this year
  const expense = db.prepare(`
    SELECT COALESCE(SUM(amount),0) AS total
    FROM transactions
    WHERE club_id=? AND type='expense' AND strftime('%Y',date)=?
  `).get(club_id, String(year));

  // Total budget allocated
  const budget = db.prepare(`
    SELECT COALESCE(SUM(allocated),0) AS total
    FROM budgets
    WHERE club_id=? AND fiscal_year=?
  `).get(club_id, year);

  // Pending funding requests
  const pending = db.prepare(`
    SELECT COUNT(*) AS count
    FROM funding_requests
    WHERE club_id=? AND status IN ('pending','under_review')
  `).get(club_id);

  // Recent 5 transactions
  const recent = db.prepare(`
    SELECT t.*, bc.name AS category_name, bc.color, bc.icon,
           u.name AS recorded_by_name
    FROM transactions t
    LEFT JOIN budget_categories bc ON bc.id = t.category_id
    LEFT JOIN users u ON u.id = t.recorded_by
    WHERE t.club_id=?
    ORDER BY t.date DESC, t.id DESC
    LIMIT 5
  `).all(club_id);

  // Monthly summary (last 6 months)
  const monthly = db.prepare(`
    SELECT year, month, total_income, total_expense, net
    FROM vw_monthly_summary
    WHERE club_id=?
    ORDER BY year DESC, month DESC
    LIMIT 6
  `).all(club_id);

  // Budget utilization by category
  const utilization = db.prepare(`
    SELECT * FROM vw_budget_utilization
    WHERE club_id=? AND fiscal_year=?
    ORDER BY utilization_pct DESC
  `).all(club_id, year);

  res.json({
    metrics: {
      totalIncome:    income.total,
      totalExpense:   expense.total,
      netBalance:     income.total - expense.total,
      totalBudget:    budget.total,
      budgetRemaining: budget.total - expense.total,
      pendingRequests: pending.count
    },
    recentTransactions: recent,
    monthlySummary:     monthly.reverse(),
    budgetUtilization:  utilization
  });
});

module.exports = router;
```

---

## Step 3.2 — `backend/routes/budgets.js`

```javascript
// backend/routes/budgets.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/budgets — all budgets with utilization
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const year = req.query.year || new Date().getFullYear();
  const rows = db.prepare(`
    SELECT * FROM vw_budget_utilization
    WHERE club_id=? AND fiscal_year=?
    ORDER BY category_name
  `).all(req.user.club_id, Number(year));
  res.json(rows);
});

// GET /api/budgets/categories — all categories for club
router.get('/categories', authenticateToken, (req, res) => {
  const db = getDb();
  const cats = db.prepare(
    'SELECT * FROM budget_categories WHERE club_id=? ORDER BY name'
  ).all(req.user.club_id);
  res.json(cats);
});

// POST /api/budgets — create/update a budget entry
router.post('/', authenticateToken, requireRole('treasurer', 'admin'), (req, res) => {
  const { category_id, fiscal_year, month, allocated, notes } = req.body;
  if (!category_id || !fiscal_year || allocated === undefined) {
    return res.status(400).json({ error: 'category_id, fiscal_year, allocated required' });
  }

  const db = getDb();
  const existing = db.prepare(`
    SELECT id FROM budgets
    WHERE club_id=? AND category_id=? AND fiscal_year=? AND month IS ?
  `).get(req.user.club_id, category_id, fiscal_year, month ?? null);

  if (existing) {
    db.prepare(`
      UPDATE budgets SET allocated=?, notes=?, updated_at=datetime('now')
      WHERE id=?
    `).run(allocated, notes ?? null, existing.id);
    return res.json({ message: 'Budget updated', id: existing.id });
  }

  const result = db.prepare(`
    INSERT INTO budgets (club_id, category_id, fiscal_year, month, allocated, notes)
    VALUES (?,?,?,?,?,?)
  `).run(req.user.club_id, category_id, fiscal_year, month ?? null, allocated, notes ?? null);

  res.status(201).json({ message: 'Budget created', id: result.lastInsertRowid });
});

// DELETE /api/budgets/:id
router.delete('/:id', authenticateToken, requireRole('treasurer', 'admin'), (req, res) => {
  const db = getDb();
  const budget = db.prepare('SELECT * FROM budgets WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  db.prepare('DELETE FROM budgets WHERE id=?').run(req.params.id);
  res.json({ message: 'Budget deleted' });
});

module.exports = router;
```

---

## Step 3.3 — `backend/routes/transactions.js`

```javascript
// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/transactions — paginated, filterable
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { club_id } = req.user;
  const {
    page = 1, limit = 20,
    type, category_id,
    from, to,
    search
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const conditions = ['t.club_id = ?'];
  const params = [club_id];

  if (type)        { conditions.push("t.type = ?");              params.push(type); }
  if (category_id) { conditions.push("t.category_id = ?");       params.push(category_id); }
  if (from)        { conditions.push("t.date >= ?");             params.push(from); }
  if (to)          { conditions.push("t.date <= ?");             params.push(to); }
  if (search)      { conditions.push("t.description LIKE ?");    params.push(`%${search}%`); }

  const where = conditions.join(' AND ');

  const total = db.prepare(`SELECT COUNT(*) AS c FROM transactions t WHERE ${where}`).get(...params);
  const rows  = db.prepare(`
    SELECT t.*, bc.name AS category_name, bc.color, bc.icon,
           u.name AS recorded_by_name
    FROM transactions t
    LEFT JOIN budget_categories bc ON bc.id = t.category_id
    LEFT JOIN users u ON u.id = t.recorded_by
    WHERE ${where}
    ORDER BY t.date DESC, t.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), offset);

  res.json({ data: rows, total: total.c, page: Number(page), limit: Number(limit) });
});

// GET /api/transactions/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const row = db.prepare(`
    SELECT t.*, bc.name AS category_name, bc.color, bc.icon
    FROM transactions t
    LEFT JOIN budget_categories bc ON bc.id = t.category_id
    WHERE t.id=? AND t.club_id=?
  `).get(req.params.id, req.user.club_id);
  if (!row) return res.status(404).json({ error: 'Transaction not found' });
  res.json(row);
});

// POST /api/transactions
router.post('/', authenticateToken, requireRole('treasurer', 'admin'), (req, res) => {
  const { type, amount, description, category_id, date, reference } = req.body;
  if (!type || !amount || !description || !date) {
    return res.status(400).json({ error: 'type, amount, description, date required' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO transactions (club_id, category_id, type, amount, description, reference, date, recorded_by)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(req.user.club_id, category_id ?? null, type, amount, description, reference ?? null, date, req.user.id);

  res.status(201).json({ message: 'Transaction recorded', id: result.lastInsertRowid });
});

// PUT /api/transactions/:id
router.put('/:id', authenticateToken, requireRole('treasurer', 'admin'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM transactions WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!existing) return res.status(404).json({ error: 'Transaction not found' });

  const { type, amount, description, category_id, date, reference } = req.body;
  db.prepare(`
    UPDATE transactions
    SET type=?, amount=?, description=?, category_id=?, date=?, reference=?
    WHERE id=?
  `).run(
    type ?? existing.type,
    amount ?? existing.amount,
    description ?? existing.description,
    category_id ?? existing.category_id,
    date ?? existing.date,
    reference ?? existing.reference,
    req.params.id
  );
  res.json({ message: 'Transaction updated' });
});

// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, requireRole('treasurer', 'admin'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM transactions WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!existing) return res.status(404).json({ error: 'Transaction not found' });
  db.prepare('DELETE FROM transactions WHERE id=?').run(req.params.id);
  res.json({ message: 'Transaction deleted' });
});

module.exports = router;
```

---

## Step 3.4 — `backend/routes/funding.js`

```javascript
// backend/routes/funding.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const BASE_QUERY = `
  SELECT fr.*,
    u1.name AS requested_by_name, u1.avatar_initials AS requester_avatar,
    u2.name AS reviewed_by_name,
    bc.name AS category_name, bc.icon AS category_icon, bc.color AS category_color
  FROM funding_requests fr
  JOIN users u1 ON u1.id = fr.requested_by
  LEFT JOIN users u2 ON u2.id = fr.reviewed_by
  LEFT JOIN budget_categories bc ON bc.id = fr.category_id
`;

// GET /api/funding
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { status, priority } = req.query;
  const conditions = ['fr.club_id = ?'];
  const params = [req.user.club_id];

  if (status)   { conditions.push('fr.status = ?');   params.push(status); }
  if (priority) { conditions.push('fr.priority = ?'); params.push(priority); }

  const rows = db.prepare(`${BASE_QUERY} WHERE ${conditions.join(' AND ')} ORDER BY fr.submitted_at DESC`).all(...params);
  res.json(rows);
});

// GET /api/funding/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const row = db.prepare(`${BASE_QUERY} WHERE fr.id=? AND fr.club_id=?`).get(req.params.id, req.user.club_id);
  if (!row) return res.status(404).json({ error: 'Funding request not found' });
  res.json(row);
});

// POST /api/funding — any logged-in member can submit
router.post('/', authenticateToken, (req, res) => {
  const { title, description, amount, category_id, priority, event_date } = req.body;
  if (!title || !amount) return res.status(400).json({ error: 'title and amount required' });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO funding_requests
      (club_id, requested_by, category_id, title, description, amount, priority, event_date)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    req.user.club_id, req.user.id,
    category_id ?? null, title, description ?? null,
    amount, priority ?? 'medium', event_date ?? null
  );
  res.status(201).json({ message: 'Funding request submitted', id: result.lastInsertRowid });
});

// PATCH /api/funding/:id/review — treasurer/admin only
router.patch('/:id/review', authenticateToken, requireRole('treasurer', 'admin'), (req, res) => {
  const { status, reviewer_note } = req.body;
  const validStatuses = ['approved', 'rejected', 'under_review', 'pending'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM funding_requests WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!existing) return res.status(404).json({ error: 'Funding request not found' });

  db.prepare(`
    UPDATE funding_requests
    SET status=?, reviewed_by=?, reviewer_note=?, reviewed_at=datetime('now')
    WHERE id=?
  `).run(status, req.user.id, reviewer_note ?? null, req.params.id);

  res.json({ message: `Request ${status}` });
});

// DELETE /api/funding/:id — only requester or admin
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM funding_requests WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!row) return res.status(404).json({ error: 'Funding request not found' });
  if (row.requested_by !== req.user.id && req.user.role === 'member') {
    return res.status(403).json({ error: 'Cannot delete another member\'s request' });
  }
  db.prepare('DELETE FROM funding_requests WHERE id=?').run(req.params.id);
  res.json({ message: 'Funding request deleted' });
});

module.exports = router;
```

---

## Step 3.5 — `backend/routes/reports.js`

```javascript
// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports/expense-breakdown?year=2025
router.get('/expense-breakdown', authenticateToken, (req, res) => {
  const db = getDb();
  const year = req.query.year || new Date().getFullYear();
  const rows = db.prepare(`
    SELECT bc.name AS category, bc.color, bc.icon,
           COALESCE(SUM(t.amount),0) AS total
    FROM budget_categories bc
    LEFT JOIN transactions t ON t.category_id=bc.id
      AND t.club_id=bc.club_id
      AND t.type='expense'
      AND strftime('%Y',t.date)=?
    WHERE bc.club_id=?
    GROUP BY bc.id
    ORDER BY total DESC
  `).all(String(year), req.user.club_id);
  res.json(rows);
});

// GET /api/reports/monthly?year=2025
router.get('/monthly', authenticateToken, (req, res) => {
  const db = getDb();
  const year = req.query.year || new Date().getFullYear();
  const rows = db.prepare(`
    SELECT month, total_income, total_expense, net
    FROM vw_monthly_summary
    WHERE club_id=? AND year=?
    ORDER BY month
  `).all(req.user.club_id, String(year));

  // Fill in missing months with zeros
  const filled = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    const found = rows.find(r => r.month === m);
    return found || { month: m, total_income: 0, total_expense: 0, net: 0 };
  });
  res.json(filled);
});

// GET /api/reports/transactions-export?from=2025-01-01&to=2025-12-31
// Returns all transactions as flat JSON for client-side PDF/Excel generation
router.get('/transactions-export', authenticateToken, (req, res) => {
  const db = getDb();
  const { from, to, year } = req.query;
  const fromDate = from || `${year || new Date().getFullYear()}-01-01`;
  const toDate   = to   || `${year || new Date().getFullYear()}-12-31`;

  const rows = db.prepare(`
    SELECT t.id, t.date, t.type, t.amount, t.description, t.reference,
           bc.name AS category, u.name AS recorded_by
    FROM transactions t
    LEFT JOIN budget_categories bc ON bc.id = t.category_id
    LEFT JOIN users u ON u.id = t.recorded_by
    WHERE t.club_id=? AND t.date BETWEEN ? AND ?
    ORDER BY t.date ASC
  `).all(req.user.club_id, fromDate, toDate);

  res.json(rows);
});

// GET /api/reports/summary — high-level financial summary
router.get('/summary', authenticateToken, (req, res) => {
  const db = getDb();
  const year = req.query.year || new Date().getFullYear();
  const club_id = req.user.club_id;

  const income  = db.prepare(`SELECT COALESCE(SUM(amount),0) AS t FROM transactions WHERE club_id=? AND type='income'  AND strftime('%Y',date)=?`).get(club_id, String(year));
  const expense = db.prepare(`SELECT COALESCE(SUM(amount),0) AS t FROM transactions WHERE club_id=? AND type='expense' AND strftime('%Y',date)=?`).get(club_id, String(year));
  const budget  = db.prepare(`SELECT COALESCE(SUM(allocated),0) AS t FROM budgets WHERE club_id=? AND fiscal_year=?`).get(club_id, Number(year));
  const txCount = db.prepare(`SELECT COUNT(*) AS c FROM transactions WHERE club_id=? AND strftime('%Y',date)=?`).get(club_id, String(year));
  const util    = db.prepare(`SELECT * FROM vw_budget_utilization WHERE club_id=? AND fiscal_year=? ORDER BY utilization_pct DESC`).all(club_id, Number(year));

  res.json({
    year,
    totalIncome:  income.t,
    totalExpense: expense.t,
    netBalance:   income.t - expense.t,
    totalBudget:  budget.t,
    transactions: txCount.c,
    budgetUtilization: util
  });
});

module.exports = router;
```

---

## Step 3.6 — `backend/routes/ai.js`

```javascript
// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/ai/chat
router.post('/chat', authenticateToken, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const db = getDb();
  const { club_id } = req.user;
  const year = new Date().getFullYear();

  // Build financial context for the AI
  const summary = db.prepare(`
    SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount END),0)  AS income,
           COALESCE(SUM(CASE WHEN type='expense' THEN amount END),0) AS expense
    FROM transactions WHERE club_id=? AND strftime('%Y',date)=?
  `).get(club_id, String(year));

  const topExpenses = db.prepare(`
    SELECT bc.name, COALESCE(SUM(t.amount),0) AS total
    FROM transactions t JOIN budget_categories bc ON bc.id=t.category_id
    WHERE t.club_id=? AND t.type='expense' AND strftime('%Y',t.date)=?
    GROUP BY bc.id ORDER BY total DESC LIMIT 5
  `).all(club_id, String(year));

  const pendingCount = db.prepare(`SELECT COUNT(*) AS c FROM funding_requests WHERE club_id=? AND status IN ('pending','under_review')`).get(club_id);

  const systemPrompt = `You are SparkBot, an AI financial assistant for SparkClub — a student innovation club.
You help the treasurer manage club finances, answer questions, suggest optimizations, and explain best practices.

Current Financial Snapshot (FY${year}):
- Total Income: ₹${summary.income.toLocaleString('en-IN')}
- Total Expense: ₹${summary.expense.toLocaleString('en-IN')}
- Net Balance: ₹${(summary.income - summary.expense).toLocaleString('en-IN')}
- Pending Funding Requests: ${pendingCount.c}
- Top Spending Categories: ${topExpenses.map(e => `${e.name} (₹${e.total.toLocaleString('en-IN')})`).join(', ')}

Guidelines:
- All amounts are in Indian Rupees (₹).
- Be concise, helpful, and specific to the club's financial context.
- Provide actionable suggestions when asked for recommendations.
- If asked about specific data not in your context, say you'd need to check the records.`;

  try {
    // Build messages array (include history for multi-turn)
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await response.json();
    const reply = data.content.map(b => b.text || '').join('');

    // Persist conversation
    const insertMsg = db.prepare(`INSERT INTO ai_conversations (club_id, user_id, role, content) VALUES (?,?,?,?)`);
    insertMsg.run(club_id, req.user.id, 'user', message);
    insertMsg.run(club_id, req.user.id, 'assistant', reply);

    res.json({ reply });
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// GET /api/ai/suggestions — proactive budget suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  const db = getDb();
  const { club_id } = req.user;
  const year = new Date().getFullYear();

  const utilization = db.prepare(`SELECT * FROM vw_budget_utilization WHERE club_id=? AND fiscal_year=?`).all(club_id, Number(year));

  const prompt = `Given these budget utilization figures for a student club, provide 3-4 specific, actionable financial suggestions. Return as JSON array of objects with keys: title (string), suggestion (string), type (one of: 'optimize','warning','opportunity','best_practice').

Data: ${JSON.stringify(utilization)}

Respond with only valid JSON, no markdown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(text);
    res.json(suggestions);
  } catch (err) {
    console.error('AI suggestions error:', err);
    // Return fallback suggestions if AI fails
    res.json([
      { title: 'Review High Utilization', suggestion: 'Check categories over 80% utilization for potential overspending.', type: 'warning' },
      { title: 'Reallocate Surplus', suggestion: 'Move funds from under-utilized categories to higher-demand areas.', type: 'optimize' }
    ]);
  }
});

module.exports = router;
```

---

## Step 3.7 — Wire All Routes into `server.js`

In `backend/server.js`, **uncomment** the route lines (replace the commented block):
```javascript
// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/budgets',      require('./routes/budgets'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/funding',      require('./routes/funding'));
app.use('/api/reports',      require('./routes/reports'));
app.use('/api/ai',           require('./routes/ai'));
```

---

## Step 3.8 — Test Key Endpoints

```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@sparkclub.edu","password":"password123"}' | \
  node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")

# Dashboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/dashboard

# Transactions (first page)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/transactions?page=1&limit=5"

# Budget utilization
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/budgets

# Funding requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/funding

# Reports monthly
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/reports/monthly?year=2025"
```

---

## Checkpoint ✅
After this phase:
- All 6 route files exist and are wired into server
- Dashboard returns `metrics`, `recentTransactions`, `monthlySummary`, `budgetUtilization`
- CRUD works for transactions, budgets, funding requests
- Reports return structured data for charts
- AI endpoint calls Anthropic API (requires `.env` key set)
