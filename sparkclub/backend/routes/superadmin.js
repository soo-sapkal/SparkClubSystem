// backend/routes/superadmin.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireSuperAdmin);

const VALID_ROLES = ['member', 'student_head', 'treasurer', 'faculty_advisor', 'faculty_coordinator', 'club_head', 'department_lead', 'event_lead', 'admin', 'faculty', 'super_admin'];
const PROMOTABLE_ROLES = ['student_head', 'treasurer', 'faculty_advisor', 'faculty_coordinator', 'department_lead', 'event_lead'];
const BLOCKED_TRANSITIONS = ['member->super_admin'];

function isValidTransition(fromRole, toRole) {
  if (fromRole === 'super_admin' || toRole === 'super_admin') return false;
  if (fromRole === toRole) return true;
  if (fromRole === 'member' && toRole === 'super_admin') return false;
  return true;
}

// GET /api/superadmin/dashboard — Global executive dashboard
router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();

    // Platform summary
    const totalClubs = db.prepare(`SELECT COUNT(*) as val FROM clubs`).get()?.val || 0;
    const totalUsers = db.prepare(`SELECT COUNT(*) as val FROM users`).get()?.val || 0;
    const totalFaculty = db.prepare(`SELECT COUNT(*) as val FROM users WHERE role='faculty'`).get()?.val || 0;
    const totalClubHeads = db.prepare(`SELECT COUNT(*) as val FROM users WHERE role='club_head'`).get()?.val || 0;
    const totalTreasurers = db.prepare(`SELECT COUNT(*) as val FROM users WHERE role='treasurer'`).get()?.val || 0;
    const totalMembers = db.prepare(`SELECT COUNT(*) as val FROM users WHERE role='member'`).get()?.val || 0;

    // Pending approvals platform-wide
    const pendingApprovals = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE status='pending'`).get()?.val || 0;
    const pendingEvents = db.prepare(`SELECT COUNT(*) as val FROM events WHERE status='planning'`).get()?.val || 0;

    // Financial overview
    const totalIncome = db.prepare(`SELECT COALESCE(SUM(amount),0) as val FROM transactions WHERE type='income'`).get()?.val || 0;
    const totalExpenses = db.prepare(`SELECT COALESCE(SUM(amount),0) as val FROM transactions WHERE type='expense'`).get()?.val || 0;

    // Recent activity
    const recentAuditLogs = db.prepare(`
      SELECT al.*, u.name as user_name, c.name as club_name
      FROM audit_logs al
      JOIN users u ON u.id = al.user_id
      LEFT JOIN clubs c ON c.id = al.club_id
      ORDER BY al.created_at DESC LIMIT 10
    `).all();

    // Top spending clubs
    const clubSpending = db.prepare(`
      SELECT c.name, COALESCE(SUM(t.amount),0) as spent
      FROM clubs c
      LEFT JOIN transactions t ON t.club_id = c.id AND t.type='expense'
      GROUP BY c.id
      ORDER BY spent DESC
      LIMIT 5
    `).all();

    // Compliance metrics
    const totalFundingRequests = db.prepare(`SELECT COUNT(*) as val FROM funding_requests`).get()?.val || 0;
    const approvedRequests = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE status='approved'`).get()?.val || 0;
    const rejectedRequests = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE status='rejected'`).get()?.val || 0;
    const complianceRate = totalFundingRequests > 0 ? Math.round((approvedRequests / totalFundingRequests) * 100) : 100;

    res.json({
      platformSummary: {
        totalClubs,
        totalUsers,
        activeClubs: totalClubs, // Simplified
        totalFaculty,
        totalClubHeads,
        totalTreasurers,
        totalMembers
      },
      pendingApprovals: {
        fundingRequests: pendingApprovals,
        events: pendingEvents
      },
      financialOverview: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses
      },
      recentActivity: recentAuditLogs,
      topSpendingClubs: clubSpending,
      complianceMetrics: {
        totalRequests: totalFundingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        complianceRate
      }
    });
  } catch (err) {
    console.error('Super admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// GET /api/superadmin/clubs — All clubs management
router.get('/clubs', (req, res) => {
  try {
    const db = getDb();
    const clubs = db.prepare(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM users WHERE club_id=c.id) as member_count,
             (SELECT COUNT(*) FROM team_members WHERE club_id=c.id AND is_active=1) as team_size,
             (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE club_id=c.id AND type='expense') as total_spent
      FROM clubs c
      ORDER BY c.name
    `).all();

    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load clubs' });
  }
});

// POST /api/superadmin/clubs — Create new club
router.post('/clubs', (req, res) => {
  try {
    const db = getDb();
    const { name, description, category } = req.body;
    const result = db.prepare(`INSERT INTO clubs (name, description, category) VALUES (?, ?, ?)`).run(name, description || '', category || 'General');
    res.status(201).json({ message: 'Club created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// PATCH /api/superadmin/clubs/:id — Update club
router.patch('/clubs/:id', (req, res) => {
  try {
    const db = getDb();
    const { name, description, category, status } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name=?'); params.push(name); }
    if (description !== undefined) { updates.push('description=?'); params.push(description); }
    if (category) { updates.push('category=?'); params.push(category); }
    if (status) { updates.push('status=?'); params.push(status); }
    if (updates.length > 0) {
      params.push(req.params.id);
      db.prepare(`UPDATE clubs SET ${updates.join(', ')} WHERE id=?`).run(...params);
    }
    res.json({ message: 'Club updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update club' });
  }
});

// GET /api/superadmin/users — All users management
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const { role, club_id, status, search } = req.query;
    let query = `SELECT u.id, u.name, u.email, u.role, u.avatar_initials, u.created_at, u.status, u.phone, u.college, u.department, u.year, c.name as club_name
                 FROM users u LEFT JOIN clubs c ON c.id = u.club_id WHERE 1=1`;
    const params = [];
    if (role) { query += ' AND u.role = ?'; params.push(role); }
    if (club_id) { query += ' AND u.club_id = ?'; params.push(club_id); }
    if (status) { query += ' AND u.status = ?'; params.push(status); }
    if (search) { query += ' AND (u.name LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY u.created_at DESC';
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// PATCH /api/superadmin/users/:id — Update user (generic)
router.patch('/users/:id', (req, res) => {
  try {
    const db = getDb();
    const { name, role, club_id, status } = req.body;
    const userId = parseInt(req.params.id);

    const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const updates = [];
    const params = [];

    if (name) { updates.push('name=?'); params.push(name); }
    if (club_id !== undefined) { updates.push('club_id=?'); params.push(club_id || null); }
    if (status && ['active', 'inactive'].includes(status)) { updates.push('status=?'); params.push(status); }
    if (role && VALID_ROLES.includes(role)) {
      if (!isValidTransition(targetUser.role, role)) {
        return res.status(403).json({ error: 'Invalid role transition' });
      }
      updates.push('role=?'); params.push(role);
    }

    if (updates.length > 0) {
      updates.push('updated_at=datetime("now")');
      params.push(userId);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id=?`).run(...params);
    }

    const updatedUser = db.prepare('SELECT id, name, email, role, status, club_id FROM users WHERE id=?').get(userId);
    res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// PATCH /api/superadmin/users/:id/role — Promote/demote user role
router.patch('/users/:id/role', (req, res) => {
  try {
    const db = getDb();
    const { role } = req.body;
    const userId = parseInt(req.params.id);

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    if (!isValidTransition(targetUser.role, role)) {
      return res.status(403).json({ error: 'Role transition not allowed. Cannot assign super_admin or invalid roles.' });
    }

    db.prepare('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?').run(role, userId);

    const updatedUser = db.prepare('SELECT id, name, email, role, status FROM users WHERE id=?').get(userId);
    res.json({ message: 'Role updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// PATCH /api/superadmin/users/:id/status — Activate/deactivate account
router.patch('/users/:id/status', (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    const userId = parseInt(req.params.id);

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active or inactive.' });
    }

    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    db.prepare('UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, userId);

    const updatedUser = db.prepare('SELECT id, name, email, role, status FROM users WHERE id=?').get(userId);
    res.json({ message: 'Status updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/superadmin/faculty — All faculty coordinators
router.get('/faculty', (req, res) => {
  try {
    const db = getDb();
    const faculty = db.prepare(`
      SELECT u.*, c.name as club_name
      FROM users u
      LEFT JOIN clubs c ON c.id = u.club_id
      WHERE u.role='faculty'
      ORDER BY u.name
    `).all();
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load faculty' });
  }
});

// GET /api/superadmin/audit — Global audit logs
router.get('/audit', (req, res) => {
  try {
    const db = getDb();
    const { limit = 100 } = req.query;
    const logs = db.prepare(`
      SELECT al.*, u.name as user_name, u.role as user_role, c.name as club_name
      FROM audit_logs al
      JOIN users u ON u.id = al.user_id
      LEFT JOIN clubs c ON c.id = al.club_id
      ORDER BY al.created_at DESC LIMIT ?
    `).all(Number(limit));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load audit logs' });
  }
});

// GET /api/superadmin/analytics — Platform analytics
router.get('/analytics', (req, res) => {
  try {
    const db = getDb();
    
    // Club performance comparison
    const clubPerformance = db.prepare(`
      SELECT c.id, c.name,
             (SELECT COUNT(*) FROM users WHERE club_id=c.id) as users,
             (SELECT COUNT(*) FROM events WHERE club_id=c.id) as events,
             (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE club_id=c.id AND type='income') as income,
             (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE club_id=c.id AND type='expense') as expenses
      FROM clubs c
    `).all();

    // Monthly trends
    const monthlyTrends = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
             SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
             SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      GROUP BY month
      ORDER BY month DESC LIMIT 12
    `).all();

    // Role distribution
    const roleDistribution = db.prepare(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `).all();

    res.json({
      clubPerformance,
      monthlyTrends,
      roleDistribution
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// GET /api/superadmin/settings — Super admin settings
router.get('/settings', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(`SELECT id, name, email, role FROM users WHERE id=?`).get(req.user.id);
    res.json({
      profile: user,
      platformSettings: {
        allowNewClubs: true,
        requireFacultyApproval: true,
        defaultCurrency: 'INR'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// POST /api/superadmin/emergency — Emergency controls
router.post('/emergency', (req, res) => {
  try {
    const { action, target, target_id } = req.body;
    console.log(`Emergency action: ${action} on ${target} ID: ${target_id} by super admin ${req.user.id}`);
    res.json({ message: `Emergency action ${action} applied` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute emergency action' });
  }
});

module.exports = router;