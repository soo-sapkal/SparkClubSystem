// backend/routes/audit.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/audit — all audit logs
router.get('/', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  const { limit = 100, entity_type } = req.query;
  let query = `SELECT al.*, u.name AS user_name FROM audit_logs al JOIN users u ON u.id=al.user_id WHERE al.club_id=?`;
  const params = [req.user.club_id];
  if (entity_type) { query += ' AND al.entity_type=?'; params.push(entity_type); }
  query += ' ORDER BY al.created_at DESC LIMIT ?';
  params.push(Number(limit));
  res.json(db.prepare(query).all(...params));
});

module.exports = router;