// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/dashboard — main metrics snapshot
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { club_id } = req.user;
  const year = new Date().getFullYear();

  // Total income this year
  const income = db.prepare(`
    SELECT COALESCE(SUM(amount),0) AS total
    FROM transactions
    WHERE club_id=? AND type='income' AND strftime('%Y',date)=?
  `).get(club_id, String(year));

  // Total expense this year
  const expense = db.prepare(`
    SELECT COALESCE(SUM(amount),0) AS total
    FROM transactions
    WHERE club_id=? AND type='expense' AND strftime('%Y',date)=?
  `).get(club_id, String(year));

  // Total budget allocated
  const budget = db.prepare(`
    SELECT COALESCE(SUM(allocated),0) AS total
    FROM budgets
    WHERE club_id=? AND fiscal_year=?
  `).get(club_id, year);

  // Pending funding requests
  const pending = db.prepare(`
    SELECT COUNT(*) AS count
    FROM funding_requests
    WHERE club_id=? AND status IN ('pending','under_review')
  `).get(club_id);

  // Recent 5 transactions
  const recent = db.prepare(`
    SELECT t.*, bc.name AS category_name, bc.color, bc.icon,
           u.name AS recorded_by_name
    FROM transactions t
    LEFT JOIN budget_categories bc ON bc.id = t.category_id
    LEFT JOIN users u ON u.id = t.recorded_by
    WHERE t.club_id=?
    ORDER BY t.date DESC, t.id DESC
    LIMIT 5
  `).all(club_id);

  // Monthly summary (last 6 months)
  const monthly = db.prepare(`
    SELECT year, month, total_income, total_expense, net
    FROM vw_monthly_summary
    WHERE club_id=?
    ORDER BY year DESC, month DESC
    LIMIT 6
  `).all(club_id);

  // Budget utilization by category
  const utilization = db.prepare(`
    SELECT * FROM vw_budget_utilization
    WHERE club_id=? AND fiscal_year=?
    ORDER BY utilization_pct DESC
  `).all(club_id, year);

  res.json({
    metrics: {
      totalIncome:    income.total,
      totalExpense:   expense.total,
      netBalance:     income.total - expense.total,
      totalBudget:    budget.total,
      budgetRemaining: budget.total - expense.total,
      pendingRequests: pending.count
    },
    recentTransactions: recent,
    monthlySummary:     monthly.reverse(),
    budgetUtilization:  utilization
  });
});

module.exports = router;
