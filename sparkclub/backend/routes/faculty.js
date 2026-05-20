// backend/routes/faculty.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/faculty/dashboard — Executive overview for faculty
router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    // Financial snapshot
    const annualBudget = db.prepare(`SELECT COALESCE(SUM(allocated),0) as val FROM budgets WHERE club_id=?`).get(club_id)?.val || 0;
    const totalSpent = db.prepare(`SELECT COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as val FROM transactions WHERE club_id=?`).get(club_id)?.val || 0;
    const pendingApprovals = db.prepare(`SELECT COALESCE(SUM(amount),0) as val FROM funding_requests WHERE club_id=? AND status='pending'`).get(club_id)?.val || 0;
    const reimbursementQueue = db.prepare(`SELECT COALESCE(SUM(amount),0) as val FROM funding_requests WHERE club_id=? AND status IN ('pending','under_review')`).get(club_id)?.val || 0;

    // Governance health indicators
    const policyViolations = db.prepare(`SELECT COUNT(*) as val FROM audit_logs WHERE club_id=? AND action LIKE '%rejected%' OR action LIKE '%violation%'`).get(club_id)?.val || 0;
    const delayedApprovals = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=? AND status='pending' AND submitted_at < datetime('now', '-7 days')`).get(club_id)?.val || 0;
    
    // Compliance score (calculated)
    const totalRequests = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=?`).get(club_id)?.val || 0;
    const approvedRequests = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=? AND status='approved'`).get(club_id)?.val || 0;
    const complianceScore = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 100;

    // Upcoming events
    const upcomingEvents = db.prepare(`SELECT * FROM events WHERE club_id=? AND status IN ('active','planning') ORDER BY start_date ASC LIMIT 5`).all(club_id);
    
    // Active projects/tasks
    const activeTasks = db.prepare(`SELECT COUNT(*) as val FROM tasks WHERE club_id=? AND status NOT IN ('completed')`).get(club_id)?.val || 0;

    // Sponsorship negotiations
    const activeNegotiations = db.prepare(`SELECT COUNT(*) as val FROM sponsor_pipeline WHERE club_id=? AND stage NOT IN ('confirmed','closed_lost')`).get(club_id)?.val || 0;

    // Student funding requests count
    const studentFundingRequests = db.prepare(`SELECT COUNT(*) as val FROM student_dev_requests WHERE club_id=? AND status='pending'`).get(club_id)?.val || 0;

    // Member count
    const memberCount = db.prepare(`SELECT COUNT(*) as val FROM team_members WHERE club_id=? AND is_active=1`).get(club_id)?.val || 0;

    res.json({
      financialSnapshot: {
        annualBudget,
        spent: totalSpent,
        remaining: annualBudget - totalSpent,
        pendingApproval: pendingApprovals,
        reimbursementQueue,
        emergencyRequests: pendingApprovals > 50000 ? 3 : 0
      },
      governanceHealth: {
        complianceScore,
        policyViolations,
        delayedApprovals,
        highRiskTransactions: policyViolations,
        pendingDocumentation: delayedApprovals
      },
      clubActivity: {
        upcomingEvents,
        activeProjects: activeTasks,
        ongoingHackathons: upcomingEvents.filter(e => e.event_type === 'hackathon').length,
        studentFundingRequests,
        sponsorshipNegotiations: activeNegotiations,
        memberCount
      }
    });
  } catch (err) {
    console.error('Faculty dashboard error:', err);
    res.status(500).json({ error: 'Failed to load faculty dashboard' });
  }
});

// GET /api/faculty/approvals — All pending approvals for faculty review
router.get('/approvals', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;
    const { type } = req.query;

    let whereClause = 'fr.club_id = ?';
    const params = [club_id];

    if (type === 'funding') {
      whereClause += ' AND fr.category_id IS NOT NULL';
    } else if (type === 'events') {
      whereClause += ' AND e.status IN (\'planning\')';
    } else if (type === 'sponsors') {
      whereClause += ' AND sp.stage IN (\'proposal_sent\',\'negotiation\')';
    }

    // Funding requests
    const fundingRequests = db.prepare(`
      SELECT fr.*, u.name as requested_by_name, u.email as requested_by_email, 
             bc.name as category_name, r.name as reviewed_by_name
      FROM funding_requests fr
      JOIN users u ON u.id = fr.requested_by
      LEFT JOIN budget_categories bc ON bc.id = fr.category_id
      LEFT JOIN users r ON r.id = fr.reviewed_by
      WHERE ${whereClause}
      ORDER BY fr.submitted_at DESC
    `).all(...params);

    // Event proposals
    const eventProposals = db.prepare(`
      SELECT e.*, u.name as coordinator_name
      FROM events e
      LEFT JOIN users u ON u.id = e.coordinator_id
      WHERE e.club_id=? AND e.status='planning'
      ORDER BY e.start_date ASC
    `).all(club_id);

    // Sponsorship proposals
    const sponsorshipProposals = db.prepare(`
      SELECT sp.*, s.company_name, s.tier
      FROM sponsor_pipeline sp
      JOIN sponsors s ON s.id = sp.sponsor_id
      WHERE sp.club_id=? AND sp.stage IN ('proposal_sent','negotiation')
      ORDER BY sp.created_at DESC
    `).all(club_id);

    // Student dev requests
    const studentRequests = db.prepare(`
      SELECT sdr.*, u.name as requested_by_name, u.email as requested_by_email
      FROM student_dev_requests sdr
      JOIN users u ON u.id = sdr.requested_by
      WHERE sdr.club_id=? AND sdr.status='pending'
      ORDER BY sdr.submitted_at DESC
    `).all(club_id);

    res.json({
      fundingRequests,
      eventProposals,
      sponsorshipProposals,
      studentRequests
    });
  } catch (err) {
    console.error('Faculty approvals error:', err);
    res.status(500).json({ error: 'Failed to load approvals' });
  }
});

// PATCH /api/faculty/approve-funding — Approve/reject funding request
router.patch('/approve-funding/:id', (req, res) => {
  try {
    const db = getDb();
    const { status, reviewer_note } = req.body;
    const valid = ['approved', 'rejected', 'under_review', 'revision_requested'];
    
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare(`
      UPDATE funding_requests 
      SET status=?, reviewed_by=?, reviewer_note=?, reviewed_at=datetime('now')
      WHERE id=? AND club_id=?
    `).run(status, req.user.id, reviewer_note || null, req.params.id, req.user.club_id);

    // Log the action
    db.prepare(`INSERT INTO audit_logs (club_id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)`).run(
      req.user.club_id, req.user.id, `faculty_funding_${status}`,
      'funding_request', req.params.id, reviewer_note || `Status changed to ${status}`
    );

    res.json({ message: `Funding request ${status}` });
  } catch (err) {
    console.error('Approve funding error:', err);
    res.status(500).json({ error: 'Failed to update funding request' });
  }
});

// PATCH /api/faculty/approve-event — Approve/reject event
router.patch('/approve-event/:id', (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    
    db.prepare(`UPDATE events SET status=? WHERE id=? AND club_id=?`)
      .run(status, req.params.id, req.user.club_id);

    res.json({ message: `Event ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// PATCH /api/faculty/approve-sponsorship — Approve/reject sponsorship
router.patch('/approve-sponsorship/:id', (req, res) => {
  try {
    const db = getDb();
    const { stage, notes } = req.body;
    
    db.prepare(`UPDATE sponsor_pipeline SET stage=? WHERE id=? AND club_id=?`)
      .run(stage, req.params.id, req.user.club_id);

    res.json({ message: `Sponsorship ${stage}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update sponsorship' });
  }
});

// GET /api/faculty/financials — Detailed financial oversight
router.get('/financials', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;
    const { start_date, end_date, category, department } = req.query;

    let dateFilter = '';
    const params = [club_id];
    if (start_date) { dateFilter += ' AND date >= ?'; params.push(start_date); }
    if (end_date) { dateFilter += ' AND date <= ?'; params.push(end_date); }

    // All transactions
    const transactions = db.prepare(`
      SELECT t.*, u.name as recorded_by_name, bc.name as category_name
      FROM transactions t
      LEFT JOIN users u ON u.id = t.recorded_by
      LEFT JOIN budget_categories bc ON bc.id = t.category_id
      WHERE t.club_id=? ${dateFilter}
      ORDER BY t.date DESC LIMIT 100
    `).all(...params);

    // Category breakdown
    const categoryBreakdown = db.prepare(`
      SELECT bc.name, bc.color,
             COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END),0) as spent
      FROM budget_categories bc
      LEFT JOIN transactions t ON t.category_id = bc.id AND t.club_id=bc.club_id ${dateFilter.replace('t.', 't.')}
      WHERE bc.club_id=?
      GROUP BY bc.id
    `).all(club_id);

    // Department spending
    const departmentSpending = db.prepare(`
      SELECT d.name, COALESCE(SUM(tx.amount),0) as spent
      FROM departments d
      LEFT JOIN team_members tm ON tm.department_id = d.id AND tm.club_id = d.club_id
      LEFT JOIN users u ON u.id = tm.user_id
      LEFT JOIN transactions tx ON tx.recorded_by = u.id AND tx.club_id = d.club_id AND tx.type='expense' ${dateFilter.replace('tx.', 'tx.')}
      WHERE d.club_id=?
      GROUP BY d.id
    `).all(club_id);

    // Monthly spending trend
    const monthlyTrend = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
             SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses,
             SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income
      FROM transactions
      WHERE club_id=? ${dateFilter}
      GROUP BY month ORDER BY month DESC LIMIT 12
    `).all(...params);

    // Vendor payments
    const vendorPayments = db.prepare(`
      SELECT description as vendor, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE club_id=? AND type='expense' AND description IS NOT NULL ${dateFilter}
      GROUP BY description
      ORDER BY total DESC LIMIT 20
    `).all(...params);

    // Budget tracking
    const budgetTracking = db.prepare(`
      SELECT b.id, b.fiscal_year, b.allocated, b.month,
             bc.name as category_name,
             COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END),0) as spent
      FROM budgets b
      JOIN budget_categories bc ON bc.id = b.category_id
      LEFT JOIN transactions t ON t.category_id = b.category_id AND t.club_id = b.club_id
      WHERE b.club_id=?
      GROUP BY b.id
      ORDER BY b.fiscal_year DESC, b.month DESC
    `).all(club_id);

    res.json({
      transactions,
      categoryBreakdown,
      departmentSpending,
      monthlyTrend,
      vendorPayments,
      budgetTracking
    });
  } catch (err) {
    console.error('Faculty financials error:', err);
    res.status(500).json({ error: 'Failed to load financials' });
  }
});

// GET /api/faculty/compliance — Compliance dashboard
router.get('/compliance', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    // Policy violations
    const violations = db.prepare(`
      SELECT al.*, u.name as user_name
      FROM audit_logs al
      JOIN users u ON u.id = al.user_id
      WHERE al.club_id=? AND (al.action LIKE '%rejected%' OR al.action LIKE '%violation%' OR al.details LIKE '%violation%')
      ORDER BY al.created_at DESC LIMIT 50
    `).all(club_id);

    // Missing documentation (funding requests without proper justification)
    const missingDocs = db.prepare(`
      SELECT fr.*, u.name as requested_by_name
      FROM funding_requests fr
      JOIN users u ON u.id = fr.requested_by
      WHERE fr.club_id=? AND (fr.description IS NULL OR fr.description = '')
      ORDER BY fr.submitted_at DESC
    `).all(club_id);

    // Unapproved expenditures
    const unapprovedExp = db.prepare(`
      SELECT t.*, u.name as recorded_by_name
      FROM transactions t
      LEFT JOIN funding_requests fr ON fr.requested_by = t.recorded_by AND fr.status = 'approved'
      JOIN users u ON u.id = t.recorded_by
      WHERE t.club_id=? AND t.type='expense' AND t.amount > 10000 AND fr.id IS NULL
      ORDER BY t.date DESC
    `).all(club_id);

    // Budget policy breaches
    const budgetBreaches = db.prepare(`
      SELECT b.*, bc.name as category_name,
             (SELECT SUM(amount) FROM transactions WHERE category_id=b.category_id AND club_id=b.club_id) as spent
      FROM budgets b
      JOIN budget_categories bc ON bc.id = b.category_id
      WHERE b.club_id=? AND (SELECT SUM(amount) FROM transactions WHERE category_id=b.category_id AND club_id=b.club_id) > b.allocated
    `).all(club_id);

    res.json({
      violations,
      missingDocumentation: missingDocs,
      unapprovedExpenditures: unapprovedExp,
      budgetPolicyBreaches: budgetBreaches,
      summary: {
        totalViolations: violations.length,
        missingDocs: missingDocs.length,
        unapprovedCount: unapprovedExp.length,
        budgetBreaches: budgetBreaches.length
      }
    });
  } catch (err) {
    console.error('Faculty compliance error:', err);
    res.status(500).json({ error: 'Failed to load compliance data' });
  }
});

// GET /api/faculty/audit — Audit trail viewer
router.get('/audit', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;
    const { limit = 100 } = req.query;

    const auditLogs = db.prepare(`
      SELECT al.*, u.name as user_name, u.role as user_role
      FROM audit_logs al
      JOIN users u ON u.id = al.user_id
      WHERE al.club_id=?
      ORDER BY al.created_at DESC LIMIT ?
    `).all(club_id, Number(limit));

    // Fraud detection - check for suspicious patterns
    const duplicateReimbursements = db.prepare(`
      SELECT t1.id as id1, t2.id as id2, t1.description, t1.amount, t1.date
      FROM transactions t1
      JOIN transactions t2 ON t1.description = t2.description AND t1.amount = t2.amount AND t1.id < t2.id
      WHERE t1.club_id=? AND t1.type='expense'
    `).all(club_id);

    res.json({
      auditLogs,
      fraudDetection: {
        duplicateReimbursements,
        suspiciousCount: duplicateReimbursements.length
      }
    });
  } catch (err) {
    console.error('Faculty audit error:', err);
    res.status(500).json({ error: 'Failed to load audit data' });
  }
});

// GET /api/faculty/events — Event oversight
router.get('/events', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    const allEvents = db.prepare(`
      SELECT e.*, u.name as coordinator_name
      FROM events e
      LEFT JOIN users u ON u.id = e.coordinator_id
      WHERE e.club_id=?
      ORDER BY e.start_date DESC
    `).all(club_id);

    // Risk assessment
    const eventsWithRisks = allEvents.map(e => {
      const riskFactors = [];
      if (!e.venue) riskFactors.push('No venue specified');
      if (e.budget_used > e.budget_allocated) riskFactors.push('Budget overrun');
      if (!e.start_date) riskFactors.push('No start date');
      return { ...e, riskFactors, riskLevel: riskFactors.length > 2 ? 'high' : riskFactors.length > 0 ? 'medium' : 'low' };
    });

    res.json({ events: eventsWithRisks });
  } catch (err) {
    console.error('Faculty events error:', err);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// GET /api/faculty/student-welfare — Student welfare oversight
router.get('/student-welfare', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    // Department funding distribution
    const deptFunding = db.prepare(`
      SELECT d.name, 
             COUNT(DISTINCT tm.user_id) as member_count,
             COALESCE(SUM(fr.amount),0) as funding_approved
      FROM departments d
      LEFT JOIN team_members tm ON tm.department_id = d.id AND tm.club_id = d.club_id
      LEFT JOIN funding_requests fr ON fr.requested_by = tm.user_id AND fr.status = 'approved'
      WHERE d.club_id=?
      GROUP BY d.id
    `).all(club_id);

    // Year-wise allocation (based on team members' join dates)
    const yearWise = db.prepare(`
      SELECT strftime('%Y', tm.joined_at) as year,
             COUNT(*) as members,
             COALESCE(SUM(tm.contribution_score),0) as total_score
      FROM team_members tm
      WHERE tm.club_id=?
      GROUP BY year
    `).all(club_id);

    // Rejected students ratio
    const totalRequests = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=?`).get(club_id)?.val || 0;
    const rejectedRequests = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=? AND status='rejected'`).get(club_id)?.val || 0;
    const rejectionRate = totalRequests > 0 ? Math.round((rejectedRequests / totalRequests) * 100) : 0;

    // Repeat beneficiaries
    const repeatBeneficiaries = db.prepare(`
      SELECT u.id, u.name, COUNT(*) as request_count, SUM(fr.amount) as total_amount
      FROM funding_requests fr
      JOIN users u ON u.id = fr.requested_by
      WHERE fr.club_id=? AND fr.status='approved'
      GROUP BY u.id
      HAVING COUNT(*) > 2
    `).all(club_id);

    res.json({
      departmentFunding: deptFunding,
      yearWiseAllocation: yearWise,
      rejectionRate,
      repeatBeneficiaries
    });
  } catch (err) {
    console.error('Student welfare error:', err);
    res.status(500).json({ error: 'Failed to load student welfare data' });
  }
});

// GET /api/faculty/documents — Document review center
router.get('/documents', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    const documents = db.prepare(`
      SELECT d.*, u.name as uploaded_by_name
      FROM documents d
      JOIN users u ON u.id = d.uploaded_by
      WHERE d.club_id=?
      ORDER BY d.created_at DESC
    `).all(club_id);

    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load documents' });
  }
});

// GET /api/faculty/communications — Communication dashboard
router.get('/communications', (req, res) => {
  try {
    // For now, return empty - can be expanded with message table
    res.json({ messages: [], alerts: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load communications' });
  }
});

// GET /api/faculty/settings — Faculty profile and settings
router.get('/settings', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(`
      SELECT id, name, email, role, avatar_initials
      FROM users WHERE id=?
    `).get(req.user.id);

    res.json({
      profile: user,
      settings: {
        notificationPreferences: true,
        approvalThreshold: 50000,
        delegationEnabled: false
      },
      emergencyControls: {
        spendingFrozen: false,
        reimbursementPaused: false,
        approvalsBlocked: false
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// POST /api/faculty/emergency-control — Emergency controls
router.post('/emergency-control', (req, res) => {
  try {
    const { action } = req.body;
    // In a real system, this would update flags in the database
    // For now, just log it
    console.log(`Emergency control: ${action} by faculty ${req.user.id}`);
    res.json({ message: `Emergency control ${action} applied` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply emergency control' });
  }
});

// GET /api/faculty/leadership — Leadership performance monitoring
router.get('/leadership', (req, res) => {
  try {
    const db = getDb();
    const { club_id } = req.user;

    // Get leadership (president, treasurer, department heads)
    const leadership = db.prepare(`
      SELECT tm.*, u.name, u.email, u.avatar_initials, d.name as department_name
      FROM team_members tm
      JOIN users u ON u.id = tm.user_id
      LEFT JOIN departments d ON d.id = tm.department_id
      WHERE tm.club_id=? AND tm.position IN ('president','vice_president','treasurer','event_lead','technical_lead','sponsorship_lead','marketing_lead','design_lead')
    `).all(club_id);

    // Calculate metrics for each leader
    const metrics = leadership.map(l => {
      // Approvals handled by this user
      const approvals = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=? AND reviewed_by=?`).get(club_id, l.user_id)?.val || 0;
      
      // Decisions quality (approved vs rejected)
      const approved = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=? AND reviewed_by=? AND status='approved'`).get(club_id, l.user_id)?.val || 0;
      const rejected = db.prepare(`SELECT COUNT(*) as val FROM funding_requests WHERE club_id=? AND reviewed_by=? AND status='rejected'`).get(club_id, l.user_id)?.val || 0;
      
      return {
        ...l,
        approvalsHandled: approvals,
        approvalRate: approvals > 0 ? Math.round((approved / approvals) * 100) : 0,
        rejectionRate: approvals > 0 ? Math.round((rejected / approvals) * 100) : 0
      };
    });

    res.json({ leadership: metrics });
  } catch (err) {
    console.error('Leadership error:', err);
    res.status(500).json({ error: 'Failed to load leadership data' });
  }
});

module.exports = router;