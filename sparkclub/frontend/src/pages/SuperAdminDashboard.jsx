// frontend/src/pages/SuperAdminDashboard.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Building2, Users, DollarSign, AlertTriangle, Shield, Activity } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadminAPI.getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { platformSummary, pendingApprovals, financialOverview, recentActivity, topSpendingClubs, complianceMetrics } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Platform Command Center</h1>
        <p className="text-slate-400 text-sm">Welcome back, {user?.name} — Global governance dashboard</p>
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card text-center">
          <Building2 className="w-5 h-5 mx-auto text-spark-400 mb-1" />
          <p className="text-xl font-bold">{platformSummary?.totalClubs || 0}</p>
          <p className="text-xs text-slate-500">Total Clubs</p>
        </div>
        <div className="card text-center">
          <Users className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
          <p className="text-xl font-bold">{platformSummary?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500">Total Users</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold">{platformSummary?.totalFaculty || 0}</p>
          <p className="text-xs text-slate-500">Faculty</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold">{platformSummary?.totalClubHeads || 0}</p>
          <p className="text-xs text-slate-500">Club Heads</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold">{platformSummary?.totalMembers || 0}</p>
          <p className="text-xs text-slate-500">Members</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold">{platformSummary?.totalTreasurers || 0}</p>
          <p className="text-xs text-slate-500">Treasurers</p>
        </div>
      </div>

      {/* Pending Approvals & Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" /> Pending Approvals
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-900/30 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">{pendingApprovals?.fundingRequests || 0}</p>
              <p className="text-xs text-slate-500">Funding Requests</p>
            </div>
            <div className="text-center p-3 bg-slate-900/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">{pendingApprovals?.events || 0}</p>
              <p className="text-xs text-slate-500">Events Pending</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Financial Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Income</span>
              <span className="text-emerald-400 font-mono">{formatINR(financialOverview?.totalIncome || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Expenses</span>
              <span className="text-red-400 font-mono">{formatINR(financialOverview?.totalExpenses || 0)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-800 pt-2">
              <span className="text-slate-400">Net Balance</span>
              <span className="font-bold font-mono">{formatINR(financialOverview?.netBalance || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance & Top Spending */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-spark-400" /> Compliance Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Requests</span>
              <span className="text-slate-300">{complianceMetrics?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Approved</span>
              <span className="text-emerald-400">{complianceMetrics?.approved || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Rejected</span>
              <span className="text-red-400">{complianceMetrics?.rejected || 0}</span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Compliance Rate</span>
                <span className="text-emerald-400 font-bold">{complianceMetrics?.complianceRate || 0}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${complianceMetrics?.complianceRate || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Top Spending Clubs
          </h3>
          <div className="space-y-2">
            {topSpendingClubs?.map((club, i) => (
              <div key={i} className="flex justify-between text-sm p-2 bg-slate-900/30 rounded">
                <span className="text-slate-300">{club.name}</span>
                <span className="text-red-400 font-mono">{formatINR(club.spent)}</span>
              </div>
            ))}
            {!topSpendingClubs?.length && <p className="text-slate-500 text-sm">No data</p>}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity?.map(log => (
            <div key={log.id} className="flex items-center justify-between p-2 bg-slate-900/30 rounded text-sm">
              <div>
                <span className="text-slate-300 capitalize">{log.action.replace(/_/g, ' ')}</span>
                <span className="text-slate-500 text-xs ml-2">by {log.user_name}</span>
              </div>
              <span className="text-slate-500 text-xs">{formatDate(log.created_at)}</span>
            </div>
          ))}
          {!recentActivity?.length && <p className="text-slate-500 text-sm">No recent activity</p>}
        </div>
      </div>
    </div>
  );
}