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
    return res.status(403).json({ error: "Cannot delete another member's request" });
  }
  db.prepare('DELETE FROM funding_requests WHERE id=?').run(req.params.id);
  res.json({ message: 'Funding request deleted' });
});

module.exports = router;
