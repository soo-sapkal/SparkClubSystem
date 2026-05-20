// frontend/src/services/api.js
import axios from 'axios';

const BASE_URL = '/api'; // Use Vite proxy in dev

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sparkclub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sparkclub_token');
      localStorage.removeItem('sparkclub_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (data) =>           api.post('/auth/register', data),
  me:       () =>               api.get('/auth/me'),
};

// ── Club Head / Executive Dashboard ─────────────────────
export const clubheadAPI = {
  getDashboard:  () =>             api.get('/clubhead/dashboard'),
  getTeam:       () =>             api.get('/clubhead/team'),
  addTeamMember: (data) =>         api.post('/clubhead/team', data),
  removeMember:  (userId) =>       api.delete(`/clubhead/team/${userId}`),
  getApprovals:  (status) =>       api.get('/clubhead/approvals', { params: { status } }),
  reviewApproval: (id, s, note) => api.patch(`/clubhead/approvals/${id}`, { status: s, reviewer_note: note }),
  getDepartments: () =>            api.get('/clubhead/departments'),
  addDepartment: (data) =>         api.post('/clubhead/departments', data),
  getStudentDev: () =>             api.get('/clubhead/student-dev'),
  reviewStudentDev: (id, s, note) => api.patch(`/clubhead/student-dev/${id}/review`, { status: s, reviewer_note: note }),
  getAudit:     (limit) =>         api.get('/clubhead/audit', { params: { limit } }),
};

// ── Events ───────────────────────────────────────────────
export const eventsAPI = {
  getAll:      (params) =>   api.get('/events', { params }),
  getById:     (id) =>       api.get(`/events/${id}`),
  create:      (data) =>     api.post('/events', data),
  update:      (id, data) => api.put(`/events/${id}`, data),
  delete:      (id) =>       api.delete(`/events/${id}`),
  register:    (id) =>       api.post(`/events/${id}/register`),
};

// ── Tasks ────────────────────────────────────────────────
export const tasksAPI = {
  getAll:   (params) =>   api.get('/tasks', { params }),
  create:   (data) =>     api.post('/tasks', data),
  update:   (id, data) => api.patch(`/tasks/${id}`, data),
  delete:   (id) =>       api.delete(`/tasks/${id}`),
};

// ── Sponsors ──────────────────────────────────────────────
export const sponsorsAPI = {
  getAll:         () =>             api.get('/sponsors'),
  create:         (data) =>         api.post('/sponsors', data),
  update:         (id, data) =>     api.put(`/sponsors/${id}`, data),
  delete:         (id) =>           api.delete(`/sponsors/${id}`),
  getPipeline:    (stage) =>        api.get('/sponsors/pipeline', { params: { stage } }),
  addPipeline:    (data) =>         api.post('/sponsors/pipeline', data),
  updatePipeline: (id, data) =>     api.patch(`/sponsors/pipeline/${id}`, data),
  deletePipeline: (id) =>           api.delete(`/sponsors/pipeline/${id}`),
};

// ── Documents ─────────────────────────────────────────────
export const documentsAPI = {
  getAll:   (params) =>   api.get('/documents', { params }),
  create:   (data) =>     api.post('/documents', data),
  delete:   (id) =>       api.delete(`/documents/${id}`),
};

// ── Student Dev ───────────────────────────────────────────
export const studentdevAPI = {
  getAll:    () =>       api.get('/student-dev'),
  create:    (data) =>   api.post('/student-dev', data),
  delete:    (id) =>     api.delete(`/student-dev/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// ── Budgets ───────────────────────────────────────────────
export const budgetsAPI = {
  getAll:       (year) =>    api.get('/budgets', { params: { year } }),
  getCategories: () =>       api.get('/budgets/categories'),
  upsert:       (data) =>    api.post('/budgets', data),
  delete:       (id) =>      api.delete(`/budgets/${id}`),
};

// ── Transactions ──────────────────────────────────────────
export const transactionsAPI = {
  getAll:  (params) =>     api.get('/transactions', { params }),
  getById: (id) =>         api.get(`/transactions/${id}`),
  create:  (data) =>       api.post('/transactions', data),
  update:  (id, data) =>   api.put(`/transactions/${id}`, data),
  delete:  (id) =>         api.delete(`/transactions/${id}`),
};

// ── Funding ───────────────────────────────────────────────
export const fundingAPI = {
  getAll:  (params) =>            api.get('/funding', { params }),
  getById: (id) =>                api.get(`/funding/${id}`),
  create:  (data) =>              api.post('/funding', data),
  review:  (id, status, note) =>  api.patch(`/funding/${id}/review`, { status, reviewer_note: note }),
  delete:  (id) =>                api.delete(`/funding/${id}`),
};

// ── Reports ───────────────────────────────────────────────
export const reportsAPI = {
  expenseBreakdown: (year) =>        api.get('/reports/expense-breakdown', { params: { year } }),
  monthly:          (year) =>        api.get('/reports/monthly', { params: { year } }),
  export:           (params) =>      api.get('/reports/transactions-export', { params }),
  summary:          (year) =>        api.get('/reports/summary', { params: { year } }),
};

// ── Faculty ─────────────────────────────────────────────────
export const facultyAPI = {
  getDashboard:    () =>                 api.get('/faculty/dashboard'),
  getApprovals:    (params) =>           api.get('/faculty/approvals', { params }),
  approveFunding:  (id, status, note) => api.patch(`/faculty/approve-funding/${id}`, { status, reviewer_note: note }),
  approveEvent:    (id, status) =>       api.patch(`/faculty/approve-event/${id}`, { status }),
  approveSponsorship: (id, stage, notes) => api.patch(`/faculty/approve-sponsorship/${id}`, { stage, notes }),
  getFinancials:   (params) =>           api.get('/faculty/financials', { params }),
  getCompliance:   () =>                 api.get('/faculty/compliance'),
  getAudit:        (limit) =>             api.get('/faculty/audit', { params: { limit } }),
  getEvents:       () =>                 api.get('/faculty/events'),
  getStudentWelfare: () =>                api.get('/faculty/student-welfare'),
  getDocuments:    () =>                 api.get('/faculty/documents'),
  getCommunications: () =>                api.get('/faculty/communications'),
  getSettings:     () =>                 api.get('/faculty/settings'),
  emergencyControl: (action) =>          api.post('/faculty/emergency-control', { action }),
  getLeadership:   () =>                 api.get('/faculty/leadership'),
};

// ── Student ─────────────────────────────────────────────────
export const studentAPI = {
  getDashboard:    () =>             api.get('/student/dashboard'),
  getTasks:       (status) =>       api.get('/student/tasks', { params: { status } }),
  updateTask:     (id, status, note) => api.patch(`/student/tasks/${id}`, { status, progress_note: note }),
  getEvents:      () =>             api.get('/student/events'),
  getReimbursements: () =>          api.get('/student/reimbursements'),
  submitReimbursement: (data) =>    api.post('/student/reimbursements', data),
  getAttendance:  () =>              api.get('/student/attendance'),
  getPerformance: () =>             api.get('/student/performance'),
  getProfile:    () =>              api.get('/student/profile'),
  updateProfile: (data) =>         api.patch('/student/profile', data),
  getLearning:   () =>              api.get('/student/learning'),
  getAnnouncements: () =>           api.get('/student/announcements'),
  getProjects:   () =>              api.get('/student/projects'),
};

// ── Super Admin ─────────────────────────────────────────────────
export const superadminAPI = {
  getDashboard:  () =>             api.get('/superadmin/dashboard'),
  getClubs:     () =>             api.get('/superadmin/clubs'),
  createClub:   (data) =>         api.post('/superadmin/clubs', data),
  updateClub:   (id, data) =>     api.patch(`/superadmin/clubs/${id}`, data),
  getUsers:     (params) =>       api.get('/superadmin/users', { params }),
  updateUser:   (id, data) =>    api.patch(`/superadmin/users/${id}`, data),
  getFaculty:   () =>             api.get('/superadmin/faculty'),
  getAudit:     (limit) =>       api.get('/superadmin/audit', { params: { limit } }),
  getAnalytics: () =>             api.get('/superadmin/analytics'),
  getSettings:  () =>             api.get('/superadmin/settings'),
  emergency:   (data) =>         api.post('/superadmin/emergency', data),
};

export default api;
