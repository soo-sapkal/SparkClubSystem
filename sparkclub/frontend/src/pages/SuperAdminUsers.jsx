// frontend/src/pages/SuperAdminUsers.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, Search } from 'lucide-react';

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    superadminAPI.getUsers({ role: filter || undefined }).then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, [filter]);

  const ROLE_COLORS = {
    super_admin: 'bg-purple-900/60 text-purple-300',
    admin: 'bg-red-900/60 text-red-300',
    club_head: 'bg-blue-900/60 text-blue-300',
    treasurer: 'bg-yellow-900/60 text-yellow-300',
    faculty: 'bg-green-900/60 text-green-300',
    member: 'bg-slate-800 text-slate-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-slate-400 text-sm">Manage all users across the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded text-sm ${!filter ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>All</button>
        {['super_admin', 'admin', 'club_head', 'treasurer', 'faculty', 'member'].map(r => (
          <button key={r} onClick={() => setFilter(r)} className={`px-3 py-1.5 rounded text-sm capitalize ${filter === r ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{r.replace('_', ' ')}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Club</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/30">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-spark-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {u.avatar_initials || u.name?.[0]}
                      </div>
                      <span className="text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{u.email}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="py-3 text-slate-400">{u.club_name || '—'}</td>
                  <td className="py-3 text-slate-500 text-xs">{u.created_at?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <p className="text-center py-8 text-slate-500">No users found</p>}
        </div>
      )}
    </div>
  );
}