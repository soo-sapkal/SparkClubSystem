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
