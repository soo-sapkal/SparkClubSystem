// backend/routes/studentdev.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/student-dev — all requests for current user
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT sdr.*, u.name AS requested_by_name, r.name AS reviewed_by_name
    FROM student_dev_requests sdr
    JOIN users u ON u.id = sdr.requested_by
    LEFT JOIN users r ON r.id = sdr.reviewed_by
    WHERE sdr.club_id=? AND sdr.requested_by=?
    ORDER BY sdr.submitted_at DESC
  `).all(req.user.club_id, req.user.id);
  res.json(rows);
});

// POST /api/student-dev — submit a student dev request
router.post('/', (req, res) => {
  const { request_type, title, description, amount, event_name, event_date } = req.body;
  if (!title || !request_type) return res.status(400).json({ error: 'title and request_type required' });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO student_dev_requests (club_id, requested_by, request_type, title, description, amount, event_name, event_date)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(req.user.club_id, req.user.id, request_type, title, description||null, amount||0, event_name||null, event_date||null);

  db.prepare(`INSERT INTO audit_logs (club_id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)`).run(
    req.user.club_id, req.user.id, 'student_dev_request_submitted', 'student_dev_request', result.lastInsertRowid, title
  );

  res.status(201).json({ message: 'Request submitted', id: result.lastInsertRowid });
});

// DELETE /api/student-dev/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM student_dev_requests WHERE id=? AND requested_by=?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Request not found or not yours' });
  if (existing.status !== 'pending') return res.status(400).json({ error: 'Can only delete pending requests' });
  db.prepare('DELETE FROM student_dev_requests WHERE id=?').run(req.params.id);
  res.json({ message: 'Request deleted' });
});

module.exports = router;