// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const { initializeDb } = require('./db/database');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/budgets',      require('./routes/budgets'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/funding',      require('./routes/funding'));
app.use('/api/reports',      require('./routes/reports'));
app.use('/api/clubhead',     require('./routes/clubhead'));
app.use('/api/events',       require('./routes/events'));
app.use('/api/tasks',        require('./routes/tasks'));
app.use('/api/sponsors',     require('./routes/sponsors'));
app.use('/api/documents',    require('./routes/documents'));
app.use('/api/student-dev',  require('./routes/studentdev'));
app.use('/api/audit',        require('./routes/audit'));
app.use('/api/faculty',       require('./routes/faculty'));
app.use('/api/student',       require('./routes/student'));
app.use('/api/superadmin',    require('./routes/superadmin'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

// ── Error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// ── Start (after DB is ready) ────────────────────────────────
const PORT = process.env.PORT || 3001;

initializeDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SparkClub API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
