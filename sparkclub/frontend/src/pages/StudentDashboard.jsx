// frontend/src/pages/StudentDashboard.jsx
import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckSquare, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { overview, myTasks, upcomingEvents, announcements } = data || {};
  const o = overview || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-slate-400 text-sm">Here's your personal dashboard</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card text-center">
          <CheckSquare className="w-5 h-5 mx-auto text-spark-400 mb-1" />
          <p className="text-xl font-bold">{o.assignedTasks || 0}</p>
          <p className="text-xs text-slate-500">Assigned Tasks</p>
        </div>
        <div className="card text-center">
          <AlertCircle className="w-5 h-5 mx-auto text-red-400 mb-1" />
          <p className="text-xl font-bold text-red-400">{o.dueToday || 0}</p>
          <p className="text-xs text-slate-500">Due Today</p>
        </div>
        <div className="card text-center">
          <Calendar className="w-5 h-5 mx-auto text-blue-400 mb-1" />
          <p className="text-xl font-bold">{o.upcomingEvents || 0}</p>
          <p className="text-xs text-slate-500">Upcoming Events</p>
        </div>
        <div className="card text-center">
          <DollarSign className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
          <p className="text-xl font-bold text-yellow-400">{formatINR(o.pendingReimbursement)}</p>
          <p className="text-xs text-slate-500">Pending Refund</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
          <p className="text-xl font-bold text-emerald-400">{o.contributionScore || 0}</p>
          <p className="text-xs text-slate-500">Contribution Score</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold text-purple-400">{o.attendanceScore || 0}%</p>
          <p className="text-xs text-slate-500">Attendance</p>
        </div>
      </div>

      {/* My Tasks */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
        <div className="space-y-3">
          {myTasks?.map(task => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-slate-200">{task.title}</p>
                <p className="text-xs text-slate-500">Due: {task.deadline || 'No deadline'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.status === 'todo' ? 'bg-slate-800 text-slate-400' :
                task.status === 'in_progress' ? 'bg-blue-900/60 text-blue-300' :
                task.status === 'blocked' ? 'bg-red-900/60 text-red-300' :
                'bg-yellow-900/60 text-yellow-300'
              }`}>{task.status}</span>
            </div>
          ))}
          {!myTasks?.length && <p className="text-slate-500 text-sm">No pending tasks</p>}
        </div>
        <a href="/student-tasks" className="text-xs text-spark-400 mt-3 inline-block">View all tasks →</a>
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
        <div className="space-y-3">
          {upcomingEvents?.map(ev => (
            <div key={ev.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎪</span>
                <div>
                  <p className="font-medium text-slate-200">{ev.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(ev.start_date)} • {ev.venue || 'TBD'}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${ev.status === 'active' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-yellow-900/60 text-yellow-300'}`}>
                {ev.status}
              </span>
            </div>
          ))}
          {!upcomingEvents?.length && <p className="text-slate-500 text-sm">No upcoming events</p>}
        </div>
      </div>
    </div>
  );
}