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
