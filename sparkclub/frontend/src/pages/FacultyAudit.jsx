// frontend/src/pages/FacultyAudit.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Search, AlertTriangle } from 'lucide-react';

export default function FacultyAudit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    facultyAPI.getAudit(limit)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return <LoadingSpinner />;

  const { auditLogs, fraudDetection } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit & Investigations</h1>
          <p className="text-slate-400 text-sm">Track approval history and detect anomalies</p>
        </div>
        <select className="input w-40" value={limit} onChange={e => setLimit(e.target.value)}>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={200}>Last 200</option>
        </select>
      </div>

      {/* Fraud Detection */}
      <div className="card border-yellow-800/50">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold">Fraud Detection</h2>
        </div>
        {fraudDetection?.suspiciousCount > 0 ? (
          <div className="space-y-3">
            <p className="text-yellow-400 text-sm">{fraudDetection.suspiciousCount} potential issues detected</p>
            {fraudDetection.duplicateReimbursements?.map((d, i) => (
              <div key={i} className="p-3 bg-yellow-950/20 border border-yellow-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300">{d.description}</p>
                    <p className="text-xs text-slate-500">Amount: ₹{d.amount} • Date: {formatDate(d.date)}</p>
                    <p className="text-xs text-orange-400">Transaction IDs: {d.id1}, {d.id2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No suspicious patterns detected</p>
        )}
      </div>

      {/* Audit Trail */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Audit Trail</h2>
        <div className="space-y-2">
          {auditLogs?.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200 capitalize">{log.action.replace(/_/g, ' ')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${log.user_role === 'club_head' ? 'bg-purple-900/60 text-purple-300' : log.user_role === 'treasurer' ? 'bg-blue-900/60 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>
                    {log.user_role}
                  </span>
                </div>
                {log.entity_type && (
                  <p className="text-xs text-slate-500 mt-1">
                    {log.entity_type} {log.entity_id && `#${log.entity_id}`}
                    {log.details && ` • ${log.details}`}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>{log.user_name}</p>
                <p>{formatDate(log.created_at)}</p>
              </div>
            </div>
          ))}
          {!auditLogs?.length && <p className="text-center py-8 text-slate-500">No audit logs found</p>}
        </div>
      </div>
    </div>
  );
}