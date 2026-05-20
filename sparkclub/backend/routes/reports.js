// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports/expense-breakdown?year=2025
router.get('/expense-breakdown', authenticateToken, (req, res) => {
  const db = getDb();
  const year = req.query.year || new Date().getFullYear();
  const rows = db.prepare(`
    SELECT bc.name AS category, bc.color, bc.icon,
           COALESCE(SUM(t.amount),0) AS total
    FROM budget_categories bc
    LEFT JOIN transactions t ON t.category_id=bc.id
      AND t.club_id=bc.club_id
      AND t.type='expense'
      AND strftime('%Y',t.date)=?
    WHERE bc.club_id=?
    GROUP BY bc.id
    ORDER BY total DESC
  `).all(String(year), req.user.club_id);
  res.json(rows);
});

// GET /api/reports/monthly?year=2025
router.get('/monthly', authenticateToken, (req, res) => {
  const db = getDb();
  const year = req.query.year || new Date().getFullYear();
  const rows = db.prepare(`
    SELECT month, total_income, total_expense, net
    FROM vw_monthly_summary
    WHERE club_id=? AND year=?
    ORDER BY month
  `).all(req.user.club_id, String(year));

  const filled = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    const found = rows.find(r => r.month === m);
    return found || { month: m, total_income: 0, total_expense: 0, net: 0 };
  });
  res.json(filled);
});

// GET /api/reports/transactions-export
router.get('/transactions-export', authenticateToken, (req, res) => {
  const db = getDb();
  const { from, to, year } = req.query;
  const fromDate = from || `${year || new Date().getFullYear()}-01-01`;
  const toDate   = to   || `${year || new Date().getFullYear()}-12-31`;

  const rows = db.prepare(`
    SELECT t.id, t.date, t.type, t.amount, t.description, t.reference,
           bc.name AS category, u.name AS recorded_by
    FROM transactions t
    LEFT JOIN budget_categories bc ON bc.id = t.category_id
    LEFT JOIN users u ON u.id = t.recorded_by
    WHERE t.club_id=? AND t.date BETWEEN ? AND ?
    ORDER BY t.date ASC
  `).all(req.user.club_id, fromDate, toDate);

  res.json(rows);
});

// GET /api/reports/summary
router.get('/summary', authenticateToken, (req, res) => {
  const db = getDb();
  const year = req.query.year || new Date().getFullYear();
  const club_id = req.user.club_id;

  const income  = db.prepare(`SELECT COALESCE(SUM(amount),0) AS t FROM transactions WHERE club_id=? AND type='income'  AND strftime('%Y',date)=?`).get(club_id, String(year));
  const expense = db.prepare(`SELECT COALESCE(SUM(amount),0) AS t FROM transactions WHERE club_id=? AND type='expense' AND strftime('%Y',date)=?`).get(club_id, String(year));
  const budget  = db.prepare(`SELECT COALESCE(SUM(allocated),0) AS t FROM budgets WHERE club_id=? AND fiscal_year=?`).get(club_id, Number(year));
  const txCount = db.prepare(`SELECT COUNT(*) AS c FROM transactions WHERE club_id=? AND strftime('%Y',date)=?`).get(club_id, String(year));
  const util    = db.prepare(`SELECT * FROM vw_budget_utilization WHERE club_id=? AND fiscal_year=? ORDER BY utilization_pct DESC`).all(club_id, Number(year));

  res.json({
    year,
    totalIncome:  income.t,
    totalExpense: expense.t,
    netBalance:   income.t - expense.t,
    totalBudget:  budget.t,
    transactions: txCount.c,
    budgetUtilization: util
  });
});

module.exports = router;
