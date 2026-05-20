# Phase 2 — Backend Server Setup & Authentication

## Goal
Bootstrap Express server with CORS, JSON parsing, JWT auth middleware, and working login/register endpoints.

---

## Step 2.1 — Install Backend Dependencies

```bash
cd sparkclub/backend
npm install express cors dotenv jsonwebtoken bcrypt helmet morgan
npm install --save-dev nodemon
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## Step 2.2 — Create `.env`

```bash
# backend/.env
PORT=3001
JWT_SECRET=sparkclub_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## Step 2.3 — Create `backend/middleware/auth.js`

```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, club_id, name }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
```

---

## Step 2.4 — Create `backend/routes/auth.js`

```javascript
// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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
    }
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
```

---

## Step 2.5 — Create `backend/server.js`

```javascript
// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initializeDb } = require('./db/database');

// Initialize database on startup
initializeDb();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
// Additional routes added in Phase 3:
// app.use('/api/dashboard',    require('./routes/dashboard'));
// app.use('/api/budgets',      require('./routes/budgets'));
// app.use('/api/transactions', require('./routes/transactions'));
// app.use('/api/funding',      require('./routes/funding'));
// app.use('/api/reports',      require('./routes/reports'));
// app.use('/api/ai',           require('./routes/ai'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

// ── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 SparkClub API running on http://localhost:${PORT}`);
});
```

---

## Step 2.6 — Test Auth Endpoints

Start server:
```bash
cd sparkclub/backend
npm run dev
```

Test login (use curl or Postman):
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@sparkclub.edu","password":"password123"}'

# Expected: { "token": "eyJ...", "user": { ... } }

# Health check
curl http://localhost:3001/api/health
# Expected: { "status": "ok", ... }
```

---

## Checkpoint ✅
After this phase:
- Server starts without errors
- `POST /api/auth/login` returns a JWT for seeded users
- `GET /api/health` returns `{ status: "ok" }`
- Auth middleware `authenticateToken` is ready for use in routes
