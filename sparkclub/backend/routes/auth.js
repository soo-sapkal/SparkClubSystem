// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password && password.length >= 8;
}

function getRedirectForRole(role) {
  const routes = {
    super_admin: '/superadmin/dashboard',
    club_head: '/club-head',
    treasurer: '/dashboard',
    admin: '/dashboard',
    faculty: '/faculty/dashboard',
    faculty_advisor: '/faculty/dashboard',
    faculty_coordinator: '/faculty/dashboard',
    student_head: '/club-head',
    department_lead: '/club-head',
    event_lead: '/club-head',
    member: '/student/dashboard'
  };
  return routes[role] || '/student/dashboard';
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { fullName, email, password, phone, college, department, year } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, role, avatar_initials, phone, college, department, year, status) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(
    fullName.trim(),
    email.toLowerCase().trim(),
    hash,
    'member',
    initials,
    phone || null,
    college || null,
    department || null,
    year || null,
    'active'
  );

  const userId = result.lastInsertRowid;

  const user = db.prepare(
    'SELECT id, name, email, role, club_id, avatar_initials FROM users WHERE id = ?'
  ).get(userId);

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      club_id: user.club_id,
      name: user.name,
      avatar: user.avatar_initials
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      club_id: user.club_id,
      avatar: user.avatar_initials
    },
    redirectTo: getRedirectForRole(user.role)
  });
});

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

  if (user.status === 'inactive') {
    return res.status(403).json({ error: 'Account is inactive. Contact your administrator.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      club_id: user.club_id,
      name: user.name,
      avatar: user.avatar_initials
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      club_id: user.club_id,
      avatar: user.avatar_initials
    },
    redirectTo: getRedirectForRole(user.role)
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

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
