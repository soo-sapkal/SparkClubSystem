// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/ai/chat
router.post('/chat', authenticateToken, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const db = getDb();
  const { club_id } = req.user;
  const year = new Date().getFullYear();

  const summary = db.prepare(`
    SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount END),0)  AS income,
           COALESCE(SUM(CASE WHEN type='expense' THEN amount END),0) AS expense
    FROM transactions WHERE club_id=? AND strftime('%Y',date)=?
  `).get(club_id, String(year));

  const topExpenses = db.prepare(`
    SELECT bc.name, COALESCE(SUM(t.amount),0) AS total
    FROM transactions t JOIN budget_categories bc ON bc.id=t.category_id
    WHERE t.club_id=? AND t.type='expense' AND strftime('%Y',t.date)=?
    GROUP BY bc.id ORDER BY total DESC LIMIT 5
  `).all(club_id, String(year));

  const pendingCount = db.prepare(`SELECT COUNT(*) AS c FROM funding_requests WHERE club_id=? AND status IN ('pending','under_review')`).get(club_id);

  const systemPrompt = `You are SparkBot, an AI financial assistant for SparkClub — a student innovation club.
You help the treasurer manage club finances, answer questions, suggest optimizations, and explain best practices.

Current Financial Snapshot (FY${year}):
- Total Income: ₹${summary.income.toLocaleString('en-IN')}
- Total Expense: ₹${summary.expense.toLocaleString('en-IN')}
- Net Balance: ₹${(summary.income - summary.expense).toLocaleString('en-IN')}
- Pending Funding Requests: ${pendingCount.c}
- Top Spending Categories: ${topExpenses.map(e => `${e.name} (₹${e.total.toLocaleString('en-IN')})`).join(', ')}

Guidelines:
- All amounts are in Indian Rupees (₹).
- Be concise, helpful, and specific to the club's financial context.
- Provide actionable suggestions when asked for recommendations.
- If asked about specific data not in your context, say you'd need to check the records.`;

  try {
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await response.json();
    const reply = data.content.map(b => b.text || '').join('');

    const insertMsg = db.prepare(`INSERT INTO ai_conversations (club_id, user_id, role, content) VALUES (?,?,?,?)`);
    insertMsg.run(club_id, req.user.id, 'user', message);
    insertMsg.run(club_id, req.user.id, 'assistant', reply);

    res.json({ reply });
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// GET /api/ai/suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  const db = getDb();
  const { club_id } = req.user;
  const year = new Date().getFullYear();

  const utilization = db.prepare(`SELECT * FROM vw_budget_utilization WHERE club_id=? AND fiscal_year=?`).all(club_id, Number(year));

  const prompt = `Given these budget utilization figures for a student club, provide 3-4 specific, actionable financial suggestions. Return as JSON array of objects with keys: title (string), suggestion (string), type (one of: 'optimize','warning','opportunity','best_practice').

Data: ${JSON.stringify(utilization)}

Respond with only valid JSON, no markdown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(text);
    res.json(suggestions);
  } catch (err) {
    console.error('AI suggestions error:', err);
    res.json([
      { title: 'Review High Utilization', suggestion: 'Check categories over 80% utilization for potential overspending.', type: 'warning' },
      { title: 'Reallocate Surplus', suggestion: 'Move funds from under-utilized categories to higher-demand areas.', type: 'optimize' }
    ]);
  }
});

module.exports = router;
