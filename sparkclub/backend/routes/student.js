// backend/routes/student.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/student/dashboard — Personal overview
router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();
    const { id: userId, club_id } = req.user;

    // Assigned tasks count
    const assignedTasks = db.prepare(`SELECT COUNT(*) as val FROM tasks WHERE club_id=? AND assigned_to=? AND status NOT IN ('completed')`).get(club_id, userId)?.val || 0;
    const dueToday = db.prepare(`SELECT COUNT(*) as val FROM tasks WHERE club_id=? AND assigned_to=? AND deadline = date('now') AND status NOT IN ('completed')`).get(club_id, userId)?.val || 0;
    
    // Upcoming events
    const upcomingEvents = db.prepare(`
      SELECT e.* FROM events e
      WHERE e.club_id=? AND e.status IN ('active','planning')
      ORDER BY e.start_date ASC LIMIT 3
    `).all(club_id);

    // My pending reimbursement claims
    const myReimbursements = db.prepare(`
      SELECT COALESCE(SUM(amount),0) as val FROM funding_requests 
      WHERE club_id=? AND requested_by=? AND status IN ('pending','under_review')
    `).get(club_id, userId)?.val || 0;

    // My tasks
    const myTasks = db.prepare(`
      SELECT * FROM tasks WHERE club_id=? AND assigned_to=? AND status NOT IN ('completed')
      ORDER BY deadline ASC LIMIT 5
    `).all(club_id, userId);

    // Contribution score
    const teamMember = db.prepare(`SELECT contribution_score FROM team_members WHERE club_id=? AND user_id=?`).get(club_id, userId);
    const contributionScore = teamMember?.contribution_score || 0;

    // Announcements (recent audit logs that might be announcements)
    const announcements = db.prepare(`
      SELECT * FROM audit_logs WHERE club_id=? ORDER BY created_at DESC LIMIT 5
    `).all(club_id);

    res.json({
      overview: {
        assignedTasks,
        dueToday,
        upcomingEvents: upcomingEvents.length,
        pendingReimbursement: myReimbursements,
        contributionScore,
        attendanceScore: 85 // Placeholder
      },
      myTasks,
      upcomingEvents,
      announcements
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// GET /api/student/tasks — My tasks with Kanban
router.get('/tasks', (req, res) => {
  try {
    const db = getDb();
    const { id: userId, club_id } = req.user;
    const { status } = req.query;

    let query = `SELECT t.*, e.name as event_name FROM tasks t LEFT JOIN events e ON e.id = t.event_id WHERE t.club_id=? AND t.assigned_to=?`;
    const params = [club_id, userId];
    
    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY t.deadline ASC`;
    
    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (err) {
    console.error('Student tasks error:', err);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// PATCH /api/student/tasks/:id — Update task status
router.patch('/tasks/:id', (req, res) => {
  try {
    const db = getDb();
    const { status, progress_note } = req.body;
    const { id: userId, club_id } = req.user;

    const task = db.prepare(`SELECT * FROM tasks WHERE id=? AND club_id=? AND assigned_to=?`).get(req.params.id, club_id, userId);
    if (!task) return res.status(404).json({ error: 'Task not found or not assigned to you' });

    db.prepare(`UPDATE tasks SET status=?, updated_at=datetime('now') WHERE id=?`).run(status, req.params.id);
    
    // Log activity
    db.prepare(`INSERT INTO audit_logs (club_id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)`).run(
      club_id, userId, `task_${status}`, 'task', req.params.id, progress_note || `Status changed to ${status}`
    );

    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// GET /api/student/events — My event assignments
router.get('/events', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    // All active/planning events the user might be assigned to
    const events = db.prepare(`
      SELECT e.*, t.title as related_task
      FROM events e
      LEFT JOIN tasks t ON t.event_id = e.id
      WHERE e.club_id=? AND e.status IN ('active','planning')
      ORDER BY e.start_date ASC
    `).all(club_id);

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// GET /api/student/reimbursements — My reimbursement claims
router.get('/reimbursements', (req, res) => {
  try {
    const db = getDb();
    const { id: userId, club_id } = req.user;

    const claims = db.prepare(`
      SELECT fr.*, bc.name as category_name
      FROM funding_requests fr
      LEFT JOIN budget_categories bc ON bc.id = fr.category_id
      WHERE fr.club_id=? AND fr.requested_by=?
      ORDER BY fr.submitted_at DESC
    `).all(club_id, userId);

    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reimbursements' });
  }
});

// POST /api/student/reimbursements — Submit new claim
router.post('/reimbursements', (req, res) => {
  try {
    const db = getDb();
    const { id: userId, club_id, name } = req.user;
    const { amount, description, category_id, event_id } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description required' });
    }

    const result = db.prepare(`
      INSERT INTO funding_requests (club_id, requested_by, title, description, amount, category_id, event_date, status, priority)
      VALUES (?,?,?,?,?,?,'expense claim','pending','medium')
    `).run(club_id, userId, `Reimbursement: ${description.slice(0,30)}`, description, amount, category_id || null);

    // Log
    db.prepare(`INSERT INTO audit_logs (club_id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)`).run(
      club_id, userId, 'reimbursement_submitted', 'funding_request', result.lastInsertRowid, `Claim: ₹${amount}`
    );

    res.status(201).json({ message: 'Reimbursement submitted', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Submit reimbursement error:', err);
    res.status(500).json({ error: 'Failed to submit reimbursement' });
  }
});

// GET /api/student/attendance — My attendance record
router.get('/attendance', (req, res) => {
  try {
    const db = getDb();
    const { id: userId, club_id } = req.user;

    // Get tasks completed as proxy for attendance
    const completedTasks = db.prepare(`SELECT COUNT(*) as val FROM tasks WHERE club_id=? AND assigned_to=? AND status='completed'`).get(club_id, userId)?.val || 0;
    const totalTasks = db.prepare(`SELECT COUNT(*) as val FROM tasks WHERE club_id=? AND assigned_to=?`).get(club_id, userId)?.val || 0;
    
    // Events attended (placeholder - would need event_registrations table)
    const eventsAttended = 3; // Placeholder

    const attendanceRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    res.json({
      summary: {
        tasksCompleted: completedTasks,
        totalTasks,
        eventsAttended,
        attendanceRate
      },
      history: [] // Would need event registration tracking
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load attendance' });
  }
});

// GET /api/student/performance — My contribution & badges
router.get('/performance', (req, res) => {
  try {
    const db = getDb();
    const { id: userId, club_id } = req.user;

    const tm = db.prepare(`SELECT * FROM team_members WHERE club_id=? AND user_id=?`).get(club_id, userId);
    
    const tasksCompleted = db.prepare(`SELECT COUNT(*) as val FROM tasks WHERE club_id=? AND assigned_to=? AND status='completed'`).get(club_id, userId)?.val || 0;
    const eventsParticipated = 5; // Placeholder

    // Calculate badges based on metrics
    const badges = [];
    if (tasksCompleted >= 5) badges.push({ name: 'Event Warrior', icon: '🏆', description: 'Completed 5+ tasks' });
    if (tasksCompleted >= 10) badges.push({ name: 'Top Contributor', icon: '⭐', description: 'Completed 10+ tasks' });
    if (tm?.contribution_score >= 80) badges.push({ name: 'Reliable Volunteer', icon: '💪', description: 'High contribution score' });

    res.json({
      metrics: {
        tasksCompleted,
        eventsParticipated,
        contributionScore: tm?.contribution_score || 0,
        rank: 3 // Placeholder - would need ranking query
      },
      badges
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load performance' });
  }
});

// GET /api/student/profile — My profile
router.get('/profile', (req, res) => {
  try {
    const db = getDb();
    const { id: userId, club_id } = req.user;

    const user = db.prepare(`SELECT id, name, email, role, avatar_initials, prn, blood_group, batch, department FROM users WHERE id=?`).get(userId);
    const teamMember = db.prepare(`SELECT * FROM team_members WHERE club_id=? AND user_id=?`).get(club_id, userId);
    const teamDept = teamMember ? db.prepare(`SELECT name FROM departments WHERE id=?`).get(teamMember.department_id) : null;

    res.json({
      ...user,
      position: teamMember?.position || 'member',
      department: user.department || teamDept?.name || 'None',
      contribution_score: teamMember?.contribution_score || 0,
      joined_at: teamMember?.joined_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// PATCH /api/student/profile — Update profile
router.patch('/profile', (req, res) => {
  try {
    const db = getDb();
    const { id: userId } = req.user;
    const { name, prn, blood_group, batch, department } = req.body;

    const updates = [];
    const params = [];
    
    if (name) { updates.push('name=?'); params.push(name); }
    if (prn !== undefined) { updates.push('prn=?'); params.push(prn || null); }
    if (blood_group !== undefined) { updates.push('blood_group=?'); params.push(blood_group || null); }
    if (batch !== undefined) { updates.push('batch=?'); params.push(batch || null); }
    if (department !== undefined) { updates.push('department=?'); params.push(department || null); }

    if (updates.length > 0) {
      params.push(userId);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id=?`).run(...params);
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/student/learning — Learning & growth
router.get('/learning', (req, res) => {
  try {
    // Placeholder - would need a learning resources table
    res.json({
      skills: [],
      opportunities: [
        { type: 'hackathon', name: 'HackSpark 2026', date: '2026-03-20' },
        { type: 'workshop', name: 'AI Workshop', date: '2026-01-10' }
      ],
      resources: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load learning data' });
  }
});

// GET /api/student/announcements — Club communications
router.get('/announcements', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    const announcements = db.prepare(`
      SELECT al.*, u.name as from_user
      FROM audit_logs al
      JOIN users u ON u.id = al.user_id
      WHERE al.club_id=? AND al.action LIKE '%announcement%'
      ORDER BY al.created_at DESC LIMIT 20
    `).all(club_id);

    res.json(announcements.length ? announcements : [
      { id: 1, action: 'announcement', details: 'Welcome to SparkClub! Check your tasks for upcoming assignments.', created_at: new Date().toISOString(), from_user: 'Club Admin' }
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load announcements' });
  }
});

// GET /api/student/projects — Project collaboration
router.get('/projects', (req, res) => {
  try {
    // Placeholder - would need projects table
    res.json([
      { id: 1, name: 'TechFest 2026', description: 'Annual tech fest organization', status: 'active', progress: 60 },
      { id: 2, name: 'Club Website', description: 'New club website development', status: 'in_progress', progress: 40 }
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load projects' });
  }
});

module.exports = router;