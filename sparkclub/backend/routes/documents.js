// backend/routes/documents.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/documents
router.get('/', (req, res) => {
  const db = getDb();
  const { doc_type, search } = req.query;
  let query = `SELECT d.*, u.name AS uploaded_by_name FROM documents d JOIN users u ON u.id=d.uploaded_by WHERE d.club_id=?`;
  const params = [req.user.club_id];
  if (doc_type) { query += ' AND d.doc_type=?'; params.push(doc_type); }
  if (search)   { query += ' AND (d.title LIKE ? OR d.tags LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY d.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// POST /api/documents
router.post('/', requireRole('club_head', 'admin', 'treasurer'), (req, res) => {
  const { title, doc_type, file_url, tags } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const db = getDb();
  const result = db.prepare(`INSERT INTO documents (club_id, uploaded_by, title, doc_type, file_url, tags) VALUES (?,?,?,?,?,?)`).run(
    req.user.club_id, req.user.id, title, doc_type||'other', file_url||null, tags||null
  );
  res.status(201).json({ message: 'Document registered', id: result.lastInsertRowid });
});

// DELETE /api/documents/:id
router.delete('/:id', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM documents WHERE id=? AND club_id=?').run(req.params.id, req.user.club_id);
  res.json({ message: 'Document deleted' });
});

module.exports = router;