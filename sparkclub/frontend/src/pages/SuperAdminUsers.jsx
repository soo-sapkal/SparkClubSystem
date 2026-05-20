// frontend/src/pages/SuperAdminUsers.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, Search, Shield, UserX, UserCheck, ChevronDown, X } from 'lucide-react';

const ROLE_COLORS = {
  super_admin: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  admin: 'bg-red-900/60 text-red-300 border-red-700/50',
  club_head: 'bg-blue-900/60 text-blue-300 border-blue-700/50',
  student_head: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
  treasurer: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50',
  faculty: 'bg-green-900/60 text-green-300 border-green-700/50',
  faculty_advisor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  faculty_coordinator: 'bg-teal-900/60 text-teal-300 border-teal-700/50',
  department_lead: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50',
  event_lead: 'bg-orange-900/60 text-orange-300 border-orange-700/50',
  member: 'bg-slate-800 text-slate-400 border-slate-700'
};

const STATUS_COLORS = {
  active: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
  inactive: 'bg-slate-800/60 text-slate-500 border-slate-700'
};

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'student_head', label: 'Student Head' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'faculty_advisor', label: 'Faculty Advisor' },
  { value: 'faculty_coordinator', label: 'Faculty Coordinator' },
  { value: 'department_lead', label: 'Department Lead' },
  { value: 'event_lead', label: 'Event Lead' },
  { value: 'club_head', label: 'Club Head' },
  { value: 'admin', label: 'Admin' },
];

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showRoleMenu, setShowRoleMenu] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const r = await superadminAPI.getUsers(params);
      setUsers(r.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search) loadUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleRoleChange(userId, newRole) {
    setUpdating(true);
    try {
      await superadminAPI.updateUser(userId, { role: newRole });
      await loadUsers();
      setShowRoleMenu(null);
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdating(false);
    }
  }

  async function handleStatusChange(userId, newStatus) {
    setUpdating(true);
    try {
      await superadminAPI.updateUser(userId, { status: newStatus });
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-slate-400 text-sm">Manage all users across the platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Shield size={16} />
          <span>{users.length} users</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-slate-900/40 backdrop-blur border border-slate-800/50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">College</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {u.avatar_initials || u.name?.[0]}
                      </div>
                      <span className="text-slate-200 font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowRoleMenu(showRoleMenu === u.id ? null : u.id);
                          setEditingUser(u);
                        }}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${ROLE_COLORS[u.role] || ROLE_COLORS.member}`}
                      >
                        {u.role?.replace('_', ' ')}
                        <ChevronDown size={12} />
                      </button>
                      {showRoleMenu === u.id && (
                        <div className="absolute z-20 mt-1 w-48 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl py-1">
                          {ROLE_OPTIONS.filter(r => r.value !== 'super_admin').map(r => (
                            <button
                              key={r.value}
                              onClick={() => handleRoleChange(u.id, r.value)}
                              disabled={updating || u.role === r.value}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800/60 transition-colors ${u.role === r.value ? 'text-cyan-400' : 'text-slate-300'} ${u.role === r.value ? 'opacity-50' : ''}`}
                            >
                              {r.label}
                              {u.role === r.value && ' (current)'}
                            </button>
                          ))}
                          <button
                            onClick={() => setShowRoleMenu(null)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-800/60 border-t border-slate-800/50 mt-1 pt-1"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-lg border ${STATUS_COLORS[u.status] || STATUS_COLORS.active}`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{u.college || '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{u.created_at?.split('T')[0]}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.status === 'active' || !u.status ? (
                        <button
                          onClick={() => handleStatusChange(u.id, 'inactive')}
                          disabled={updating}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors"
                          title="Deactivate"
                        >
                          <UserX size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u.id, 'active')}
                          disabled={updating}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Activate"
                        >
                          <UserCheck size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-500">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close role menu */}
      {showRoleMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(null)} />
      )}
    </div>
  );
}