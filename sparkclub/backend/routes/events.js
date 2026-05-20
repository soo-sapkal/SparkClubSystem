// backend/routes/events.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/events
router.get('/', (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let query = `SELECT e.*, u.name AS coordinator_name FROM events e LEFT JOIN users u ON u.id=e.coordinator_id WHERE e.club_id=?`;
  const params = [req.user.club_id];
  if (status) { query += ' AND e.status=?'; params.push(status); }
  query += ' ORDER BY e.start_date DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const event = db.prepare(`SELECT e.*, u.name AS coordinator_name FROM events e LEFT JOIN users u ON u.id=e.coordinator_id WHERE e.id=? AND e.club_id=?`).get(req.params.id, req.user.club_id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const registrations = db.prepare(`SELECT er.*, u.name AS user_name FROM event_registrations er JOIN users u ON u.id=er.user_id WHERE er.event_id=?`).all(req.params.id);
  res.json({ ...event, registrations });
});

// POST /api/events
router.post('/', requireRole('club_head', 'admin', 'event_lead'), (req, res) => {
  const { name, description, event_type, start_date, end_date, venue, coordinator_id, budget_allocated } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO events (club_id, name, description, event_type, start_date, end_date, venue, coordinator_id, budget_allocated)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(req.user.club_id, name, description||null, event_type||'other', start_date||null, end_date||null, venue||null, coordinator_id||null, budget_allocated||0);
  res.status(201).json({ message: 'Event created', id: result.lastInsertRowid });
});

// PUT /api/events/:id
router.put('/:id', requireRole('club_head', 'admin', 'event_lead'), (req, res) => {
  const { name, description, event_type, status, start_date, end_date, venue, coordinator_id, budget_allocated, budget_used, expected_turnout, actual_turnout, revenue_generated } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM events WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  db.prepare(`
    UPDATE events SET name=?, description=?, event_type=?, status=?, start_date=?, end_date=?, venue=?,
    coordinator_id=?, budget_allocated=?, budget_used=?, expected_turnout=?, actual_turnout=?, revenue_generated=?
    WHERE id=?
  `).run(
    name ?? existing.name, description ?? existing.description, event_type ?? existing.event_type,
    status ?? existing.status, start_date ?? existing.start_date, end_date ?? existing.end_date,
    venue ?? existing.venue, coordinator_id ?? existing.coordinator_id,
    budget_allocated ?? existing.budget_allocated, budget_used ?? existing.budget_used,
    expected_turnout ?? existing.expected_turnout, actual_turnout ?? existing.actual_turnout,
    revenue_generated ?? existing.revenue_generated, req.params.id
  );
  res.json({ message: 'Event updated' });
});

// DELETE /api/events/:id
router.delete('/:id', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM events WHERE id=? AND club_id=?').run(req.params.id, req.user.club_id);
  res.json({ message: 'Event deleted' });
});

// POST /api/events/:id/register
router.post('/:id/register', (req, res) => {
  const db = getDb();
  const result = db.prepare(`INSERT INTO event_registrations (event_id, user_id) VALUES (?,?)`).run(req.params.id, req.user.id);
  res.status(201).json({ message: 'Registered', id: result.lastInsertRowid });
});

module.exports = router;