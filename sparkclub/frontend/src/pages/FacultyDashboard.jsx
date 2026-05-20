// frontend/src/pages/FacultyDashboard.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { DollarSign, AlertTriangle, Shield, Users, Calendar, Trophy, FileCheck, Clock } from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    facultyAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(err => {
        console.error('Faculty dashboard error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 p-4">Error loading dashboard: {error}</div>;

  const { financialSnapshot, governanceHealth, clubActivity } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Faculty Coordinator Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name} — Institutional oversight for SparkClub</p>
      </div>

      {/* Financial Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card text-center">
          <DollarSign className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
          <p className="text-xs text-slate-500">Annual Budget</p>
          <p className="text-lg font-bold text-emerald-400">{formatINR(financialSnapshot?.annualBudget)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500">Spent</p>
          <p className="text-lg font-bold text-red-400">{formatINR(financialSnapshot?.spent)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500">Remaining</p>
          <p className="text-lg font-bold text-spark-400">{formatINR(financialSnapshot?.remaining)}</p>
        </div>
        <div className="card text-center">
          <Clock className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
          <p className="text-xs text-slate-500">Pending Approval</p>
          <p className="text-lg font-bold text-yellow-400">{formatINR(financialSnapshot?.pendingApproval)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500">Reimbursement Queue</p>
          <p className="text-lg font-bold text-orange-400">{formatINR(financialSnapshot?.reimbursementQueue)}</p>
        </div>
        <div className="card text-center">
          <AlertTriangle className="w-5 h-5 mx-auto text-red-400 mb-1" />
          <p className="text-xs text-slate-500">Emergency Requests</p>
          <p className="text-lg font-bold text-red-400">{financialSnapshot?.emergencyRequests || 0}</p>
        </div>
      </div>

      {/* Governance Health Indicators */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-spark-400" />
          <h2 className="text-lg font-semibold">Governance Health Indicators</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-400">{governanceHealth?.complianceScore || 0}%</p>
            <p className="text-xs text-slate-500">Compliance Score</p>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-red-400">{governanceHealth?.policyViolations || 0}</p>
            <p className="text-xs text-slate-500">Policy Violations</p>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-orange-400">{governanceHealth?.highRiskTransactions || 0}</p>
            <p className="text-xs text-slate-500">High Risk Transactions</p>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-400">{governanceHealth?.delayedApprovals || 0}</p>
            <p className="text-xs text-slate-500">Delayed Approvals</p>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-slate-400">{governanceHealth?.pendingDocumentation || 0}</p>
            <p className="text-xs text-slate-500">Pending Documentation</p>
          </div>
        </div>
      </div>

      {/* Club Activity Overview */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-spark-400" />
          <h2 className="text-lg font-semibold">Club Activity Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-xl font-bold">{clubActivity?.upcomingEvents?.length || 0}</p>
              <p className="text-xs text-slate-500">Upcoming Events</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
            <Trophy className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-xl font-bold">{clubActivity?.ongoingHackathons || 0}</p>
              <p className="text-xs text-slate-500">Hackathons</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
            <Users className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-xl font-bold">{clubActivity?.memberCount || 0}</p>
              <p className="text-xs text-slate-500">Team Members</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
            <FileCheck className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-xl font-bold">{clubActivity?.studentFundingRequests || 0}</p>
              <p className="text-xs text-slate-500">Funding Requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
            <DollarSign className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-xl font-bold">{clubActivity?.sponsorshipNegotiations || 0}</p>
              <p className="text-xs text-slate-500">Sponsorships</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-xl font-bold">{clubActivity?.activeProjects || 0}</p>
              <p className="text-xs text-slate-500">Active Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Preview */}
      {clubActivity?.upcomingEvents?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {clubActivity.upcomingEvents.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎪</span>
                  <div>
                    <p className="font-medium text-slate-200">{ev.name}</p>
                    <p className="text-xs text-slate-500">{ev.venue || 'TBD'} • {formatDate(ev.start_date)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${ev.status === 'active' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-yellow-900/60 text-yellow-300'}`}>
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}