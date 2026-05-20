// frontend/src/pages/FacultyWelfare.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { formatINR } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, DollarSign, AlertTriangle } from 'lucide-react';

export default function FacultyWelfare() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyAPI.getStudentWelfare()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { departmentFunding, yearWiseAllocation, rejectionRate, repeatBeneficiaries } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Welfare Oversight</h1>
        <p className="text-slate-400 text-sm">Ensure fair funding allocation and equal opportunity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Users className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-emerald-400">{departmentFunding?.reduce((s, d) => s + (d.member_count || 0), 0) || 0}</p>
          <p className="text-xs text-slate-500">Total Members</p>
        </div>
        <div className="card text-center">
          <DollarSign className="w-6 h-6 mx-auto text-spark-400 mb-2" />
          <p className="text-2xl font-bold text-spark-400">{formatINR(departmentFunding?.reduce((s, d) => s + (d.funding_approved || 0), 0) || 0)}</p>
          <p className="text-xs text-slate-500">Total Funding Approved</p>
        </div>
        <div className="card text-center">
          <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${rejectionRate > 30 ? 'text-red-400' : 'text-yellow-400'}`} />
          <p className={`text-2xl font-bold ${rejectionRate > 30 ? 'text-red-400' : 'text-yellow-400'}`}>{rejectionRate}%</p>
          <p className="text-xs text-slate-500">Rejection Rate</p>
        </div>
        <div className="card text-center">
          <Users className="w-6 h-6 mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-purple-400">{repeatBeneficiaries?.length || 0}</p>
          <p className="text-xs text-slate-500">Repeat Beneficiaries</p>
        </div>
      </div>

      {/* Department Funding Distribution */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Department Funding Distribution</h2>
        <div className="space-y-3">
          {departmentFunding?.map(d => (
            <div key={d.name} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-200">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.member_count} members</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-emerald-400">{formatINR(d.funding_approved)}</p>
              </div>
            </div>
          ))}
          {!departmentFunding?.length && <p className="text-slate-500 text-sm">No department data</p>}
        </div>
      </div>

      {/* Year-wise Allocation */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Year-wise Member Distribution</h2>
        <div className="space-y-3">
          {yearWiseAllocation?.map(y => (
            <div key={y.year} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <div>
                <p className="font-medium text-slate-200">Year {y.year || 'Unknown'}</p>
                <p className="text-xs text-slate-500">{y.members} members</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Avg Score: {y.members > 0 ? Math.round(y.total_score / y.members) : 0}</p>
              </div>
            </div>
          ))}
          {!yearWiseAllocation?.length && <p className="text-slate-500 text-sm">No year data</p>}
        </div>
      </div>

      {/* Repeat Beneficiaries */}
      {repeatBeneficiaries?.length > 0 && (
        <div className="card border-yellow-800/50">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">Repeat Beneficiaries (Funding {'>'} 2 requests)</h2>
          <div className="space-y-2">
            {repeatBeneficiaries.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-yellow-950/20 border border-yellow-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-200">{b.name}</p>
                  <p className="text-xs text-slate-500">{b.request_count} funding requests</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-yellow-400">{formatINR(b.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}