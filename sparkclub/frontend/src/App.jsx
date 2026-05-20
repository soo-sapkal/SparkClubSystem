// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage         from './pages/LoginPage';
import LandingPage       from './pages/LandingPage';
import DashboardPage     from './pages/DashboardPage';
import BudgetsPage       from './pages/BudgetsPage';
import TransactionsPage  from './pages/TransactionsPage';
import FundingPage       from './pages/FundingPage';
import ReportsPage       from './pages/ReportsPage';
import ClubHeadDashboard from './pages/ClubHeadDashboard';
import EventManagement   from './pages/EventManagement';
import TasksPage         from './pages/TasksPage';
import TeamManagement    from './pages/TeamManagement';
import SponsorshipManagement from './pages/SponsorshipManagement';
import DocumentsPage     from './pages/DocumentsPage';
import StudentDevPage    from './pages/StudentDevPage';
import AuditLogPage      from './pages/AuditLogPage';
import FacultyDashboard  from './pages/FacultyDashboard';
import FacultyApprovals   from './pages/FacultyApprovals';
import FacultyFinancials  from './pages/FacultyFinancials';
import FacultyCompliance  from './pages/FacultyCompliance';
import FacultyAudit      from './pages/FacultyAudit';
import FacultyEvents     from './pages/FacultyEvents';
import FacultyWelfare    from './pages/FacultyWelfare';
import FacultyDocuments  from './pages/FacultyDocuments';
import FacultySettings   from './pages/FacultySettings';
import StudentDashboard  from './pages/StudentDashboard';
import StudentTasks      from './pages/StudentTasks';
import StudentReimbursements from './pages/StudentReimbursements';
import StudentAttendance from './pages/StudentAttendance';
import StudentPerformance from './pages/StudentPerformance';
import StudentProfile    from './pages/StudentProfile';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminClubs    from './pages/SuperAdminClubs';
import SuperAdminUsers    from './pages/SuperAdminUsers';
import SuperAdminAudit    from './pages/SuperAdminAudit';
import SuperAdminFaculty  from './pages/SuperAdminFaculty';
import SuperAdminAnalytics from './pages/SuperAdminAnalytics';
import SuperAdminSettings from './pages/SuperAdminSettings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function ClubHeadRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'club_head') return <Navigate to="/dashboard" replace />;
  return children;
}

function FacultyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'faculty') return <Navigate to="/dashboard" replace />;
  return children;
}

function StudentRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'member') return <Navigate to="/dashboard" replace />;
  return children;
}

function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'super_admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes with Layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>

        {/* Club Head Executive Dashboard */}
        <Route path="club-head" element={
          <ClubHeadRoute>
            <ClubHeadDashboard />
          </ClubHeadRoute>
        } />
        <Route path="events"       element={<EventManagement />} />
        <Route path="tasks"         element={<TasksPage />} />
        <Route path="team"          element={<TeamManagement />} />
        <Route path="sponsors"      element={<SponsorshipManagement />} />
        <Route path="documents"     element={<DocumentsPage />} />
        <Route path="student-dev"   element={<StudentDevPage />} />
        <Route path="audit"         element={<AuditLogPage />} />

        {/* Treasurer/Admin Finance Routes */}
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="budgets"        element={<BudgetsPage />} />
        <Route path="transactions"  element={<TransactionsPage />} />
        <Route path="funding"        element={<FundingPage />} />
        <Route path="reports"        element={<ReportsPage />} />
      </Route>

      {/* Faculty Coordinator Routes - separate Layout wrapper */}
      <Route path="/faculty" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/faculty/dashboard" replace />} />
        <Route path="dashboard" element={<FacultyRoute><FacultyDashboard /></FacultyRoute>} />
        <Route path="approvals" element={<FacultyRoute><FacultyApprovals /></FacultyRoute>} />
        <Route path="financials" element={<FacultyRoute><FacultyFinancials /></FacultyRoute>} />
        <Route path="compliance" element={<FacultyRoute><FacultyCompliance /></FacultyRoute>} />
        <Route path="faculty-audit" element={<FacultyRoute><FacultyAudit /></FacultyRoute>} />
        <Route path="events" element={<FacultyRoute><FacultyEvents /></FacultyRoute>} />
        <Route path="welfare" element={<FacultyRoute><FacultyWelfare /></FacultyRoute>} />
        <Route path="documents" element={<FacultyRoute><FacultyDocuments /></FacultyRoute>} />
        <Route path="settings" element={<FacultyRoute><FacultySettings /></FacultyRoute>} />
      </Route>

      {/* Student/Member Routes */}
      <Route path="/student" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="tasks" element={<StudentRoute><StudentTasks /></StudentRoute>} />
        <Route path="reimbursements" element={<StudentRoute><StudentReimbursements /></StudentRoute>} />
        <Route path="attendance" element={<StudentRoute><StudentAttendance /></StudentRoute>} />
        <Route path="performance" element={<StudentRoute><StudentPerformance /></StudentRoute>} />
        <Route path="profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />
      </Route>

      {/* Super Admin Routes */}
      <Route path="/superadmin" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
        <Route path="clubs" element={<SuperAdminRoute><SuperAdminClubs /></SuperAdminRoute>} />
        <Route path="users" element={<SuperAdminRoute><SuperAdminUsers /></SuperAdminRoute>} />
        <Route path="audit" element={<SuperAdminRoute><SuperAdminAudit /></SuperAdminRoute>} />
        <Route path="faculty" element={<SuperAdminRoute><SuperAdminFaculty /></SuperAdminRoute>} />
        <Route path="analytics" element={<SuperAdminRoute><SuperAdminAnalytics /></SuperAdminRoute>} />
        <Route path="settings" element={<SuperAdminRoute><SuperAdminSettings /></SuperAdminRoute>} />
      </Route>
    </Routes>
  );
}