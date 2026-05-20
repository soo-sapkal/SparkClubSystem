// frontend/src/pages/SuperAdminAudit.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils/format';

export default function SuperAdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadminAPI.getAudit(200).then(r => setLogs(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Command Center</h1>
        <p className="text-slate-400 text-sm">Global audit trail and compliance monitoring</p>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Platform Audit Trail</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="flex items-start justify-between p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200 capitalize">{log.action.replace(/_/g, ' ')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${log.user_role === 'super_admin' ? 'bg-purple-900/60 text-purple-300' : log.user_role === 'club_head' ? 'bg-blue-900/60 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>
                    {log.user_role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  by {log.user_name} {log.club_name && `in ${log.club_name}`}
                </p>
                {log.details && <p className="text-xs text-slate-400 mt-1">{log.details}</p>}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(log.created_at)}</span>
            </div>
          ))}
          {!logs.length && <p className="text-center py-8 text-slate-500">No audit logs</p>}
        </div>
      </div>
    </div>
  );
}