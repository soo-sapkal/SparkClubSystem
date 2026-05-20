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
  const clubHeadRoles = ['club_head', 'student_head', 'department_lead', 'event_lead'];
  if (!req.user || !clubHeadRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Club Head access required' });
  }
  next();
}

function requireTreasurer(req, res, next) {
  const treasurerRoles = ['treasurer', 'admin'];
  if (!req.user || !treasurerRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Treasurer access required' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
}

function requireFaculty(req, res, next) {
  const facultyRoles = ['faculty', 'faculty_advisor', 'faculty_coordinator'];
  if (!req.user || !facultyRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Faculty access required' });
  }
  next();
}

module.exports = { authenticateToken, requireRole, requireClubHead, requireTreasurer, requireSuperAdmin, requireFaculty };
