// frontend/src/pages/AuditLogPage.jsx
import { useEffect, useState } from 'react';
import { clubheadAPI } from '../services/api';
import { formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Shield } from 'lucide-react';

const ACTION_COLORS = {
  funding_request_approved: 'text-emerald-400',
  funding_request_rejected: 'text-red-400',
  funding_request_under_review: 'text-yellow-400',
  funding_request_revision_requested: 'text-orange-400',
  student_dev_request_submitted: 'text-blue-400',
};

export default function AuditLogPage() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clubheadAPI.getAudit(100).then(r => setLogs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-spark-500/20 rounded-lg flex items-center justify-center">
          <Shield className="text-spark-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Audit & Compliance</h1>
          <p className="text-slate-400 text-sm">Complete action trail — who approved what and when</p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Entity</th>
                <th className="pb-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-900/30">
                  <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="py-3 pr-4 text-slate-200">{log.user_name}</td>
                  <td className={`py-3 pr-4 font-medium ${ACTION_COLORS[log.action] || 'text-slate-300'}`}>
                    {log.action?.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">{log.entity_type} #{log.entity_id}</td>
                  <td className="py-3 text-slate-500 text-xs max-w-xs truncate">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && <p className="text-center py-12 text-slate-500">No audit logs yet</p>}
        </div>
      )}
    </div>
  );
}