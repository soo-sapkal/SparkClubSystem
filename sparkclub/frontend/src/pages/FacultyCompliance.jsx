// frontend/src/pages/FacultyCompliance.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AlertTriangle, FileWarning, DollarSign, Shield } from 'lucide-react';

export default function FacultyCompliance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyAPI.getCompliance()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { summary, violations, missingDocumentation, unapprovedExpenditures, budgetPolicyBreaches } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
        <p className="text-slate-400 text-sm">Monitor policy violations and compliance issues</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <AlertTriangle className="w-6 h-6 mx-auto text-red-400 mb-2" />
          <p className="text-2xl font-bold text-red-400">{summary?.totalViolations || 0}</p>
          <p className="text-xs text-slate-500">Policy Violations</p>
        </div>
        <div className="card text-center">
          <FileWarning className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-yellow-400">{summary?.missingDocs || 0}</p>
          <p className="text-xs text-slate-500">Missing Documentation</p>
        </div>
        <div className="card text-center">
          <DollarSign className="w-6 h-6 mx-auto text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-orange-400">{summary?.unapprovedCount || 0}</p>
          <p className="text-xs text-slate-500">Unapproved Expenditures</p>
        </div>
        <div className="card text-center">
          <Shield className="w-6 h-6 mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-purple-400">{summary?.budgetBreaches || 0}</p>
          <p className="text-xs text-slate-500">Budget Policy Breaches</p>
        </div>
      </div>

      {/* Budget Policy Breaches */}
      {budgetPolicyBreaches?.length > 0 && (
        <div className="card border-red-800/50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" /> Budget Policy Breaches
          </h2>
          <div className="space-y-3">
            {budgetPolicyBreaches.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
                <div>
                  <p className="text-slate-200">{b.category_name}</p>
                  <p className="text-xs text-slate-500">Fiscal Year: {b.fiscal_year}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-400">Spent: {formatINR(b.spent)}</p>
                  <p className="text-sm text-slate-400">Allocated: {formatINR(b.allocated)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unapproved Expenditures */}
      {unapprovedExpenditures?.length > 0 && (
        <div className="card border-orange-800/50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-400">
            <DollarSign className="w-5 h-5" /> Unapproved Expenditures (Over ₹10,000)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Recorded By</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {unapprovedExpenditures.map(t => (
                  <tr key={t.id} className="hover:bg-slate-900/30">
                    <td className="py-3 text-slate-400">{formatDate(t.date)}</td>
                    <td className="py-3 text-slate-300">{t.description}</td>
                    <td className="py-3 text-slate-400">{t.recorded_by_name}</td>
                    <td className="py-3 text-right font-mono text-orange-400">{formatINR(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Missing Documentation */}
      {missingDocumentation?.length > 0 && (
        <div className="card border-yellow-800/50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-400">
            <FileWarning className="w-5 h-5" /> Missing Documentation
          </h2>
          <div className="space-y-2">
            {missingDocumentation.map(fr => (
              <div key={fr.id} className="flex items-center justify-between p-3 bg-yellow-950/20 border border-yellow-900/50 rounded-lg">
                <div>
                  <p className="text-slate-200">{fr.title}</p>
                  <p className="text-xs text-slate-500">By {fr.requested_by_name} • {formatDate(fr.submitted_at)}</p>
                </div>
                <span className="text-orange-400 font-mono">{formatINR(fr.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Violations */}
      {violations?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Policy Violations</h2>
          <div className="space-y-2">
            {violations.slice(0, 10).map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div>
                  <p className="text-slate-300">{v.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-500">By {v.user_name} • {formatDate(v.created_at)}</p>
                </div>
                {v.details && <p className="text-xs text-slate-400 max-w-xs truncate">{v.details}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {!summary?.totalViolations && !summary?.missingDocs && !summary?.unapprovedCount && !summary?.budgetBreaches && (
        <div className="card text-center py-12 text-slate-500">
          <Shield className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
          <p>All compliance checks passed!</p>
        </div>
      )}
    </div>
  );
}