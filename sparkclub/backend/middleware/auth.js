// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function requireClubHead(req, res, next) {
  if (!req.user || req.user.role !== 'club_head') {
    return res.status(403).json({ error: 'Club Head access required' });
  }
  next();
}

function requireTreasurer(req, res, next) {
  if (!req.user || !['treasurer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Treasurer access required' });
  }
  next();
}

module.exports = { authenticateToken, requireRole, requireClubHead, requireTreasurer };
