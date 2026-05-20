// backend/routes/sponsors.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/sponsors
router.get('/', (req, res) => {
  const db = getDb();
  const sponsors = db.prepare('SELECT * FROM sponsors WHERE club_id=? ORDER BY total_value DESC').all(req.user.club_id);
  res.json(sponsors);
});

// POST /api/sponsors
router.post('/', requireRole('club_head', 'admin', 'sponsorship_lead'), (req, res) => {
  const { company_name, contact_name, contact_email, contact_phone, tier, total_value, notes } = req.body;
  if (!company_name) return res.status(400).json({ error: 'company_name required' });
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO sponsors (club_id, company_name, contact_name, contact_email, contact_phone, tier, total_value, notes)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(req.user.club_id, company_name, contact_name||null, contact_email||null, contact_phone||null, tier||'bronze', total_value||0, notes||null);
  res.status(201).json({ message: 'Sponsor added', id: result.lastInsertRowid });
});

// PUT /api/sponsors/:id
router.put('/:id', requireRole('club_head', 'admin', 'sponsorship_lead'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM sponsors WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!existing) return res.status(404).json({ error: 'Sponsor not found' });
  const { company_name, contact_name, contact_email, contact_phone, tier, total_value, notes } = req.body;
  db.prepare(`UPDATE sponsors SET company_name=?, contact_name=?, contact_email=?, contact_phone=?, tier=?, total_value=?, notes=? WHERE id=?`).run(
    company_name ?? existing.company_name, contact_name ?? existing.contact_name,
    contact_email ?? existing.contact_email, contact_phone ?? existing.contact_phone,
    tier ?? existing.tier, total_value ?? existing.total_value,
    notes ?? existing.notes, req.params.id
  );
  res.json({ message: 'Sponsor updated' });
});

// DELETE /api/sponsors/:id
router.delete('/:id', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM sponsors WHERE id=? AND club_id=?').run(req.params.id, req.user.club_id);
  res.json({ message: 'Sponsor deleted' });
});

// GET /api/sponsors/pipeline
router.get('/pipeline', (req, res) => {
  const db = getDb();
  const { stage } = req.query;
  let query = `SELECT sp.*, s.company_name FROM sponsor_pipeline sp LEFT JOIN sponsors s ON s.id=sp.sponsor_id WHERE sp.club_id=?`;
  const params = [req.user.club_id];
  if (stage) { query += ' AND sp.stage=?'; params.push(stage); }
  query += ' ORDER BY sp.follow_up_date ASC';
  res.json(db.prepare(query).all(...params));
});

// POST /api/sponsors/pipeline
router.post('/pipeline', requireRole('club_head', 'admin', 'sponsorship_lead'), (req, res) => {
  const { sponsor_id, stage, expected_value, closed_value, follow_up_date, notes } = req.body;
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO sponsor_pipeline (club_id, sponsor_id, stage, expected_value, closed_value, follow_up_date, notes)
    VALUES (?,?,?,?,?,?,?)
  `).run(req.user.club_id, sponsor_id||null, stage||'prospect', expected_value||0, closed_value||0, follow_up_date||null, notes||null);
  res.status(201).json({ message: 'Pipeline entry added', id: result.lastInsertRowid });
});

// PATCH /api/sponsors/pipeline/:id
router.patch('/pipeline/:id', requireRole('club_head', 'admin', 'sponsorship_lead'), (req, res) => {
  const { stage, expected_value, closed_value, follow_up_date, notes } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM sponsor_pipeline WHERE id=? AND club_id=?').get(req.params.id, req.user.club_id);
  if (!existing) return res.status(404).json({ error: 'Pipeline entry not found' });

  db.prepare(`UPDATE sponsor_pipeline SET stage=?, expected_value=?, closed_value=?, follow_up_date=?, notes=?, last_interaction=datetime('now') WHERE id=?`).run(
    stage ?? existing.stage, expected_value ?? existing.expected_value,
    closed_value ?? existing.closed_value, follow_up_date ?? existing.follow_up_date,
    notes ?? existing.notes, req.params.id
  );
  res.json({ message: 'Pipeline entry updated' });
});

// DELETE /api/sponsors/pipeline/:id
router.delete('/pipeline/:id', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM sponsor_pipeline WHERE id=? AND club_id=?').run(req.params.id, req.user.club_id);
  res.json({ message: 'Pipeline entry deleted' });
});

module.exports = router;