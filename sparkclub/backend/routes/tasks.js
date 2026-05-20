// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/tasks
router.get('/', (req, res) => {
  const db = getDb();
  const { status, event_id, assigned_to } = req.query;
  let query = `SELECT t.*, u.name AS assigned_to_name, c.name AS creator_name, e.name AS event_name
               FROM tasks t LEFT JOIN users u ON u.id=t.assigned_to LEFT JOIN users c ON c.id=t.created_by LEFT JOIN events e ON e.id=t.event_id
               WHERE t.club_id=?`;
  const params = [req.user.club_id];
  if (status)    { query += ' AND t.status=?'; params.push(status); }
  if (event_id)  { query += ' AND t.event_id=?'; params.push(event_id); }
  if (assigned_to){ query += ' AND t.assigned_to=?'; params.push(assigned_to); }
  query += ' ORDER BY t.deadline ASC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// POST /api/tasks
router.post('/', requireRole('club_head', 'admin', 'event_lead', 'treasurer'), (req, res) => {
  const { title, description, event_id, assigned_to, status, priority, deadline } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO tasks (club_id, event_id, title, description, assigned_to, status, priority, deadline, created_by)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(req.user.club_id, event_id||null, title, description||null, assigned_to||null, status||'todo', priority||'medium', deadline||null, req.user.id);
  res.status(201).json({ message: 'Task created', id: result.lastInsertRowid });
});

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  const { status, priority, deadline, assigned_to } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tasks WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  db.prepare(`UPDATE tasks SET status=?, priority=?, deadline=?, assigned_to=?, updated_at=datetime('now') WHERE id=?`).run(
    status ?? existing.status, priority ?? existing.priority, deadline ?? existing.deadline,
    assigned_to ?? existing.assigned_to, req.params.id
  );
  res.json({ message: 'Task updated' });
});

// DELETE /api/tasks/:id
router.delete('/:id', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id=? AND club_id=?').run(req.params.id, req.user.club_id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;