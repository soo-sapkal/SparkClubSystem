// frontend/src/pages/ClubHeadDashboard.jsx
import { useEffect, useState } from 'react';
import { clubheadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatINR, formatDate } from '../utils/format';
import { Users, Trophy, Calendar, DollarSign, Clock, AlertCircle, TrendingUp, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      class: 'badge-pending',      icon: Clock },
  under_review: { label: 'Under Review', class: 'badge-under_review', icon: AlertCircle },
  approved:     { label: 'Approved',     class: 'badge-approved',     icon: CheckCircle },
  rejected:     { label: 'Rejected',     class: 'badge-rejected',     icon: XCircle },
  revision_requested: { label: 'Revision Needed', class: 'text-xs px-2 py-0.5 rounded-full bg-orange-900/60 text-orange-300 border border-orange-800', icon: AlertCircle },
};

const TASK_STATUS_COLORS = {
  todo: 'border-slate-700 bg-slate-900',
  in_progress: 'border-blue-800 bg-blue-950/20',
  blocked: 'border-red-800 bg-red-950/20',
  review: 'border-yellow-800 bg-yellow-950/20',
  completed: 'border-emerald-800 bg-emerald-950/20',
};

const POSITION_LABELS = {
  president: 'President', vice_president: 'Vice President', treasurer: 'Treasurer',
  event_lead: 'Event Lead', technical_lead: 'Technical Lead', sponsorship_lead: 'Sponsorship Lead',
  marketing_lead: 'Marketing Lead', design_lead: 'Design Lead', core_member: 'Core Member', volunteer: 'Volunteer'
};

export default function ClubHeadDashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    clubheadAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(err => {
        const msg = err.response?.data?.error || err.message || 'Unknown error';
        setError(msg);
        console.error('Dashboard load error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-400">Failed to load dashboard: {error}</p>;
  if (!data) return <p className="text-red-400">Failed to load dashboard: no data returned.</p>;

  const { metrics, pendingApprovals, activeTasks, upcomingEvents, departmentSpend } = data;
  const m = metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name} — here's the club at a glance</p>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Annual Budget"      value={formatINR(m.total_annual_budget)}    icon={DollarSign}  color="spark"  sub={`Used: ${formatINR(m.total_spent)}`} />
        <StatCard label="Pending Approvals"   value={m.pending_approvals || 0}              icon={Clock}        color="yellow" sub="Awaiting your review" />
        <StatCard label="Active Events"       value={m.active_events || 0}                 icon={Calendar}     color="green"  sub={`${m.events_this_month || 0} this month`} />
        <StatCard label="Team Members"       value={m.active_members || 0}                icon={Users}        color="spark"  sub={`${m.total_sponsors || 0} sponsors`} />
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-3">Revenue Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Total Sponsor Value</span>
              <span className="font-bold text-emerald-400">{formatINR(m.total_sponsor_value)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Closed Deals</span>
              <span className="font-bold text-spark-400">{m.closed_deals || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Event Revenue</span>
              <span className="font-bold text-emerald-400">{formatINR(m.total_event_revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Student Requests</span>
              <span className="font-bold text-yellow-400">{m.pending_student_requests || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-3">Department Spend</h3>
          <div className="space-y-3">
            {departmentSpend.map(d => (
              <div key={d.id} className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">{d.name}</span>
                <span className={`font-mono font-semibold ${(d.spent || 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {formatINR(d.spent || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-3">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map(ev => (
              <div key={ev.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-200">{ev.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(ev.start_date)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ev.status === 'active' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  {ev.status}
                </span>
              </div>
            ))}
            {(!upcomingEvents || upcomingEvents.length === 0) && <p className="text-slate-500 text-sm">No upcoming events</p>}
          </div>
        </div>
      </div>

      {/* Approval Center */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-200">Approval Center</h3>
          <span className="text-xs text-slate-500">{pendingApprovals.length} pending</span>
        </div>
        <div className="space-y-3">
          {pendingApprovals.map(req => {
            const Icon = STATUS_CONFIG[req.status]?.icon || Clock;
            return (
              <div key={req.id} className="flex items-center gap-4 p-3 bg-slate-950/40 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${req.status === 'approved' ? 'bg-emerald-900/50' : req.status === 'rejected' ? 'bg-red-900/50' : 'bg-yellow-900/50'}`}>
                  <Icon size={14} className={req.status === 'approved' ? 'text-emerald-400' : req.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{req.title}</p>
                  <p className="text-xs text-slate-500">by {req.requested_by_name} · {formatDate(req.submitted_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-spark-400">{formatINR(req.amount)}</p>
                  <p className={`badge-${req.status} mt-0.5`}>{STATUS_CONFIG[req.status]?.label}</p>
                </div>
              </div>
            );
          })}
          {pendingApprovals.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No pending approvals</p>}
        </div>
      </div>

      {/* Active Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-200">Active Tasks</h3>
          <a href="/tasks" className="text-xs text-spark-400 hover:text-spark-300 flex items-center gap-1">
            View Kanban <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeTasks.map(task => (
            <div key={task.id} className={`p-3 rounded-lg border ${TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.todo}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-200 line-clamp-2">{task.title}</p>
              </div>
              {task.assigned_to_name && <p className="text-xs text-slate-500 mt-1">→ {task.assigned_to_name}</p>}
              {task.deadline && <p className="text-xs text-slate-600 mt-1">Due: {task.deadline}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                  task.priority === 'urgent' ? 'border-red-700 text-red-400' :
                  task.priority === 'high' ? 'border-orange-700 text-orange-400' :
                  'border-slate-700 text-slate-400'
                }`}>{task.priority}</span>
                <span className="text-[10px] text-slate-500 capitalize">{task.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && <p className="col-span-4 text-slate-500 text-sm text-center py-4">No active tasks</p>}
        </div>
      </div>

      {/* Team quick view */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-200">Team Overview</h3>
          <a href="/team" className="text-xs text-spark-400 hover:text-spark-300 flex items-center gap-1">
            Manage Team <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-2 text-slate-400 font-medium">Name</th>
                <th className="pb-2 text-slate-400 font-medium">Position</th>
                <th className="pb-2 text-slate-400 font-medium">Department</th>
                <th className="pb-2 text-slate-400 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.teamMembers?.slice(0, 5).map(member => (
                <tr key={member.id} className="border-b border-slate-800/40">
                  <td className="py-2 text-slate-200">{member.name}</td>
                  <td className="py-2 text-slate-400 capitalize">{POSITION_LABELS[member.position] || member.position}</td>
                  <td className="py-2 text-slate-500">{member.department_name || '—'}</td>
                  <td className="py-2 text-right font-mono text-slate-200">{member.contribution_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}