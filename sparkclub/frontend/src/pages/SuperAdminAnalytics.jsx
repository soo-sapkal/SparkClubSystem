// frontend/src/pages/SuperAdminAnalytics.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import { formatINR } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export default function SuperAdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadminAPI.getAnalytics()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { clubPerformance, monthlyTrends, roleDistribution } = data || {};

  const totalUsers = roleDistribution?.reduce((sum, r) => sum + r.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-slate-400 text-sm">Comprehensive insights across all clubs</p>
      </div>

      {/* Role Distribution */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-spark-400" /> User Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {roleDistribution?.map(r => (
            <div key={r.role} className="text-center p-3 bg-slate-900/30 rounded-lg">
              <p className="text-2xl font-bold">{r.count}</p>
              <p className="text-xs text-slate-500 capitalize">{r.role?.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Club Performance */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Club Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="pb-3 font-medium">Club</th>
                <th className="pb-3 font-medium text-right">Members</th>
                <th className="pb-3 font-medium text-right">Events</th>
                <th className="pb-3 font-medium text-right">Income</th>
                <th className="pb-3 font-medium text-right">Expenses</th>
                <th className="pb-3 font-medium text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {clubPerformance?.map(club => (
                <tr key={club.id} className="border-b border-slate-800/50">
                  <td className="py-3 font-medium">{club.name}</td>
                  <td className="py-3 text-right text-slate-400">{club.users}</td>
                  <td className="py-3 text-right text-slate-400">{club.events}</td>
                  <td className="py-3 text-right text-emerald-400 font-mono">{formatINR(club.income)}</td>
                  <td className="py-3 text-right text-red-400 font-mono">{formatINR(club.expenses)}</td>
                  <td className={`py-3 text-right font-mono font-bold ${club.income - club.expenses >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatINR(club.income - club.expenses)}
                  </td>
                </tr>
              ))}
              {!clubPerformance?.length && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No club data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" /> Monthly Financial Trends
        </h3>
        <div className="space-y-3">
          {monthlyTrends?.map(m => (
            <div key={m.month} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <span className="text-sm font-medium text-slate-300">{m.month}</span>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Income</p>
                  <p className="text-sm text-emerald-400 font-mono">{formatINR(m.income)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Expenses</p>
                  <p className="text-sm text-red-400 font-mono">{formatINR(m.expenses)}</p>
                </div>
              </div>
            </div>
          ))}
          {!monthlyTrends?.length && (
            <p className="text-slate-500 text-sm text-center py-4">No trend data available</p>
          )}
        </div>
      </div>
    </div>
  );
}