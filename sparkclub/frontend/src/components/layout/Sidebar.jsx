// frontend/src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wallet, ArrowLeftRight,
  FileText, BarChart3, LogOut, Zap,
  BookOpen, Users, Calendar, Briefcase, FileCheck, ShieldCheck,
  CheckSquare, PieChart, AlertTriangle, Search, GraduationCap,
  MessageSquare, Settings, User, DollarSign
} from 'lucide-react';

const NAV_TREASURER = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/budgets',       icon: Wallet,          label: 'Budgets' },
  { to: '/transactions',  icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/funding',       icon: FileText,        label: 'Funding' },
  { to: '/reports',       icon: BarChart3,       label: 'Reports' },
];

const NAV_CLUB_HEAD = [
  { to: '/club-head',    icon: ShieldCheck, label: 'Executive' },
  { to: '/events',       icon: Calendar,     label: 'Events' },
  { to: '/tasks',        icon: FileCheck,    label: 'Tasks' },
  { to: '/team',         icon: Users,        label: 'Team' },
  { to: '/sponsors',     icon: Briefcase,    label: 'Sponsors' },
  { to: '/funding',      icon: FileText,     label: 'Approvals' },
  { to: '/documents',    icon: BookOpen,    label: 'Documents' },
  { to: '/student-dev',   icon: BookOpen,    label: 'Student Dev' },
  { to: '/audit',        icon: ShieldCheck,  label: 'Audit Log' },
];

const NAV_FACULTY = [
  { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/approvals', icon: CheckSquare,     label: 'Approvals' },
  { to: '/faculty/financials', icon: PieChart,        label: 'Financials' },
  { to: '/faculty/compliance', icon: AlertTriangle,   label: 'Compliance' },
  { to: '/faculty/faculty-audit', icon: Search,       label: 'Audit' },
  { to: '/faculty/events',    icon: Calendar,        label: 'Events' },
  { to: '/faculty/welfare',   icon: GraduationCap,   label: 'Student Welfare' },
  { to: '/faculty/documents', icon: BookOpen,         label: 'Documents' },
  { to: '/faculty/settings',  icon: Settings,        label: 'Settings' },
];

const NAV_STUDENT = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/tasks', icon: FileCheck, label: 'Tasks' },
  { to: '/student/reimbursements', icon: DollarSign, label: 'Reimbursements' },
  { to: '/student/attendance', icon: Calendar, label: 'Attendance' },
  { to: '/student/performance', icon: BarChart3, label: 'Performance' },
  { to: '/student/profile', icon: User, label: 'Profile' },
];

const NAV_SUPER_ADMIN = [
  { to: '/superadmin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/superadmin/clubs', icon: ShieldCheck, label: 'Clubs' },
  { to: '/superadmin/users', icon: Users, label: 'Users' },
  { to: '/superadmin/faculty', icon: GraduationCap, label: 'Faculty' },
  { to: '/superadmin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/superadmin/audit', icon: Search, label: 'Audit' },
  { to: '/superadmin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout, isClubHead, isFaculty, isStudent, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const nav = isSuperAdmin ? NAV_SUPER_ADMIN : (isFaculty ? NAV_FACULTY : (isStudent ? NAV_STUDENT : (isClubHead ? NAV_CLUB_HEAD : NAV_TREASURER)));

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-spark-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SparkClub</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 ml-10 capitalize">
          {isSuperAdmin ? 'Super Admin' : isFaculty ? 'Faculty Coordinator' : isStudent ? 'Student Dashboard' : isClubHead ? 'Club Head Dashboard' : 'Treasurer Dashboard'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/club-head'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-spark-500/20 text-spark-400 border border-spark-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User area */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-spark-600 rounded-full flex items-center justify-center text-xs font-bold text-slate-100">
            {user?.avatar || user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}