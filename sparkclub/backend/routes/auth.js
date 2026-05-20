// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = getDb();
  const user = db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).get(email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // For seeded users, password is 'password123'
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id:      user.id,
      email:   user.email,
      role:    user.role,
      club_id: user.club_id,
      name:    user.name,
      avatar:  user.avatar_initials
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: {
      id:      user.id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      club_id: user.club_id,
      avatar:  user.avatar_initials
    },
    redirectTo: user.role === 'super_admin' ? '/superadmin/dashboard' : user.role === 'club_head' ? '/club-head' : user.role === 'faculty' ? '/faculty/dashboard' : user.role === 'member' ? '/student/dashboard' : '/dashboard'
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role = 'member', club_id = 1 } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const result = db.prepare(
    'INSERT INTO users (club_id, name, email, password_hash, role, avatar_initials) VALUES (?,?,?,?,?,?)'
  ).run(club_id, name, email.toLowerCase(), hash, role, initials);

  res.status(201).json({
    message: 'User registered successfully',
    userId: result.lastInsertRowid
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.prepare(
    'SELECT id, name, email, role, club_id, avatar_initials FROM users WHERE id = ?'
  ).get(req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
