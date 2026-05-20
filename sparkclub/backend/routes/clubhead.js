// backend/routes/clubhead.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireClubHead, requireRole } = require('../middleware/auth');

// Apply auth to all routes
router.use(authenticateToken);

// GET /api/clubhead/dashboard — executive overview
router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    // Metrics - inline queries instead of view
    const metrics = {
      total_annual_budget: db.prepare(`SELECT COALESCE(SUM(allocated),0) as val FROM budgets WHERE club_id=? AND fiscal_year=2026`).get(club_id)?.val || 0,
      total_spent: db.prepare(`SELECT COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as val FROM transactions WHERE club_id=? AND strftime('%Y','date')='2026'`).get(club_id)?.val || 0,
      pending_approvals: db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=? AND status IN ('pending','under_review')`).get(club_id)?.val || 0,
      active_events: db.prepare(`SELECT COUNT(*) as val FROM events WHERE club_id=? AND status='active'`).get(club_id)?.val || 0,
      events_this_month: db.prepare(`SELECT COUNT(*) as val FROM events WHERE club_id=? AND strftime('%Y-%m', start_date)=strftime('%Y-%m','now')`).get(club_id)?.val || 0,
      total_event_revenue: db.prepare(`SELECT COALESCE(SUM(revenue_generated),0) as val FROM events WHERE club_id=?`).get(club_id)?.val || 0,
      active_members: db.prepare(`SELECT COUNT(*) as val FROM team_members WHERE club_id=? AND is_active=1`).get(club_id)?.val || 0,
      total_sponsors: db.prepare(`SELECT COUNT(*) as val FROM sponsors WHERE club_id=?`).get(club_id)?.val || 0,
      total_sponsor_value: db.prepare(`SELECT COALESCE(SUM(total_value),0) as val FROM sponsors WHERE club_id=?`).get(club_id)?.val || 0,
      closed_deals: db.prepare(`SELECT COUNT(*) as val FROM sponsor_pipeline WHERE club_id=? AND stage='confirmed'`).get(club_id)?.val || 0,
      pending_student_requests: db.prepare(`SELECT COUNT(*) as val FROM student_dev_requests WHERE club_id=? AND status='pending'`).get(club_id)?.val || 0
    };

    const recentFunding = db.prepare(`
      SELECT fr.*, u.name AS requested_by_name
      FROM funding_requests fr
      JOIN users u ON u.id = fr.requested_by
      WHERE fr.club_id=? AND fr.status IN ('pending','under_review')
      ORDER BY fr.submitted_at DESC LIMIT 5
    `).all(club_id);

    const activeTasks = db.prepare(`
      SELECT t.*, u.name AS assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.club_id=? AND t.status NOT IN ('completed')
      ORDER BY t.deadline ASC LIMIT 8
    `).all(club_id);

    const recentEvents = db.prepare(`
      SELECT * FROM events WHERE club_id=? AND status IN ('active','planning')
      ORDER BY start_date ASC LIMIT 5
    `).all(club_id);

    const departmentSpend = db.prepare(`
      SELECT d.name, d.id,
             COALESCE(SUM(tx.amount),0) AS spent
      FROM departments d
      LEFT JOIN team_members tm ON tm.department_id = d.id AND tm.club_id = d.club_id
      LEFT JOIN users u ON u.id = tm.user_id
      LEFT JOIN transactions tx ON tx.recorded_by = u.id AND tx.club_id = d.club_id AND tx.type='expense'
      WHERE d.club_id=?
      GROUP BY d.id
    `).all(club_id);

    res.json({
      metrics,
      pendingApprovals: recentFunding,
      activeTasks,
      upcomingEvents: recentEvents,
      departmentSpend
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load executive dashboard', detail: err.message });
  }
});

// GET /api/clubhead/team — all team members with positions
router.get('/team', (req, res) => {
  const db = getDb();
  const members = db.prepare(`
    SELECT tm.*, u.name, u.email, u.avatar_initials, d.name AS department_name
    FROM team_members tm
    JOIN users u ON u.id = tm.user_id
    LEFT JOIN departments d ON d.id = tm.department_id
    WHERE tm.club_id=?
    ORDER BY tm.contribution_score DESC
  `).all(req.user.club_id);
  res.json(members);
});

// POST /api/clubhead/team — add/update team member position
router.post('/team', requireRole('club_head', 'admin'), (req, res) => {
  const { user_id, position, department_id, contribution_score } = req.body;
  if (!user_id || !position) return res.status(400).json({ error: 'user_id and position required' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM team_members WHERE user_id=? AND club_id=?').get(user_id, req.user.club_id);

  if (existing) {
    db.prepare(`
      UPDATE team_members SET position=?, department_id=?, contribution_score=?
      WHERE id=?
    `).run(position, department_id || null, contribution_score || 0, existing.id);
    return res.json({ message: 'Team member updated' });
  }

  const result = db.prepare(`
    INSERT INTO team_members (club_id, user_id, position, department_id, contribution_score)
    VALUES (?,?,?,?,?)
  `).run(req.user.club_id, user_id, position, department_id || null, contribution_score || 0);
  res.status(201).json({ message: 'Team member added', id: result.lastInsertRowid });
});

// DELETE /api/clubhead/team/:userId
router.delete('/team/:userId', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM team_members WHERE user_id=? AND club_id=?').run(req.params.userId, req.user.club_id);
  res.json({ message: 'Team member removed' });
});

// GET /api/clubhead/approvals — all pending approvals for club head
router.get('/approvals', (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let query = `
    SELECT fr.*,
           u.name AS requested_by_name, u.avatar_initials,
           r.name AS reviewed_by_name,
           bc.name AS category_name, bc.icon
    FROM funding_requests fr
    JOIN users u ON u.id = fr.requested_by
    LEFT JOIN users r ON r.id = fr.reviewed_by
    LEFT JOIN budget_categories bc ON bc.id = fr.category_id
    WHERE fr.club_id=?
  `;
  const params = [req.user.club_id];

  if (status) { query += ' AND fr.status=?'; params.push(status); }
  query += ' ORDER BY fr.submitted_at DESC';

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// PATCH /api/clubhead/approvals/:id — approve/reject/request revision
router.patch('/approvals/:id', requireRole('club_head', 'admin', 'treasurer'), (req, res) => {
  const { status, reviewer_note } = req.body;
  const valid = ['approved', 'rejected', 'under_review', 'revision_requested', 'pending'];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
  }

  const db = getDb();
  db.prepare(`
    UPDATE funding_requests
    SET status=?, reviewed_by=?, reviewer_note=?, reviewed_at=datetime('now')
    WHERE id=? AND club_id=?
  `).run(status, req.user.id, reviewer_note || null, req.params.id, req.user.club_id);

  // Log the action
  db.prepare(`INSERT INTO audit_logs (club_id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)`).run(
    req.user.club_id, req.user.id, `funding_request_${status}`,
    'funding_request', req.params.id, reviewer_note || `Status changed to ${status}`
  );

  res.json({ message: `Request ${status}` });
});

// GET /api/clubhead/departments
router.get('/departments', (req, res) => {
  const db = getDb();
  const depts = db.prepare(`
    SELECT d.*, u.name AS head_name,
           (SELECT COUNT(*) FROM team_members WHERE department_id=d.id) AS member_count
    FROM departments d
    LEFT JOIN users u ON u.id = d.head_user_id
    WHERE d.club_id=?
  `).all(req.user.club_id);
  res.json(depts);
});

// POST /api/clubhead/departments
router.post('/departments', requireRole('club_head', 'admin'), (req, res) => {
  const { name, description, head_user_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const db = getDb();
  const result = db.prepare(`INSERT INTO departments (club_id, name, description, head_user_id) VALUES (?,?,?,?)`).run(
    req.user.club_id, name, description || null, head_user_id || null
  );
  res.status(201).json({ message: 'Department created', id: result.lastInsertRowid });
});

// GET /api/clubhead/student-dev — student development requests
router.get('/student-dev', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT sdr.*, u.name AS requested_by_name, r.name AS reviewed_by_name
    FROM student_dev_requests sdr
    JOIN users u ON u.id = sdr.requested_by
    LEFT JOIN users r ON r.id = sdr.reviewed_by
    WHERE sdr.club_id=?
    ORDER BY sdr.submitted_at DESC
  `).all(req.user.club_id);
  res.json(rows);
});

// PATCH /api/clubhead/student-dev/:id/review
router.patch('/student-dev/:id/review', requireRole('club_head', 'admin'), (req, res) => {
  const { status, reviewer_note } = req.body;
  const valid = ['approved', 'rejected', 'revision_requested', 'pending'];
  if (!status || !valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const db = getDb();
  db.prepare(`UPDATE student_dev_requests SET status=?, reviewed_by=?, reviewer_note=?, reviewed_at=datetime('now') WHERE id=? AND club_id=?`).run(
    status, req.user.id, reviewer_note || null, req.params.id, req.user.club_id
  );
  res.json({ message: `Request ${status}` });
});

// GET /api/clubhead/audit — audit logs
router.get('/audit', requireRole('club_head', 'admin'), (req, res) => {
  const db = getDb();
  const { limit = 50 } = req.query;
  const rows = db.prepare(`
    SELECT al.*, u.name AS user_name
    FROM audit_logs al
    JOIN users u ON u.id = al.user_id
    WHERE al.club_id=?
    ORDER BY al.created_at DESC LIMIT ?
  `).all(req.user.club_id, Number(limit));
  res.json(rows);
});

module.exports = router;