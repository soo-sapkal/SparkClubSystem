// frontend/src/pages/TeamManagement.jsx
import { useEffect, useState } from 'react';
import { clubheadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, X, Edit3, Trash2, UserCog } from 'lucide-react';

const POSITIONS = [
  'president', 'vice_president', 'treasurer', 'event_lead', 'technical_lead',
  'sponsorship_lead', 'marketing_lead', 'design_lead', 'core_member', 'volunteer'
];

const POSITION_LABELS = {
  president: 'President', vice_president: 'Vice President', treasurer: 'Treasurer',
  event_lead: 'Event Lead', technical_lead: 'Technical Lead', sponsorship_lead: 'Sponsorship Lead',
  marketing_lead: 'Marketing Lead', design_lead: 'Design Lead', core_member: 'Core Member', volunteer: 'Volunteer'
};

export default function TeamManagement() {
  const { isTreasurer, isClubHead, isAdmin } = useAuth();
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ user_id: '', position: 'core_member', department_id: '', contribution_score: 50 });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [departments, setDepartments] = useState([]);

  const canManage = isClubHead || isAdmin;

  const load = () => {
    Promise.all([
      clubheadAPI.getTeam(),
      clubheadAPI.getDepartments()
    ]).then(([m, d]) => {
      setMembers(m.data);
      setDepartments(d.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ user_id: '', position: 'core_member', department_id: '', contribution_score: 50 });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(m) {
    setForm({
      user_id: m.user_id,
      position: m.position,
      department_id: m.department_id || '',
      contribution_score: m.contribution_score || 50
    });
    setEditingId(m.id);
    setShowModal(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      user_id: form.user_id,
      position: form.position,
      department_id: form.department_id ? Number(form.department_id) : null,
      contribution_score: Number(form.contribution_score)
    };
    clubheadAPI.addTeamMember(payload)
      .then(() => { setShowModal(false); load(); })
      .catch(() => alert('Failed to save member'))
      .finally(() => setSubmitting(false));
  }

  async function handleRemove(userId) {
    if (!confirm('Remove this member from team?')) return;
    await clubheadAPI.removeMember(userId);
    load();
  }

  const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-slate-400 text-sm">{members.length} active members</p>
        </div>
        {canManage && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Member
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className="card hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-spark-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {m.avatar_initials || m.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="text-slate-600 hover:text-spark-400 p-1"><Edit3 size={14} /></button>
                    <button onClick={() => handleRemove(m.user_id)} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Position</span>
                  <span className="text-slate-200 capitalize">{POSITION_LABELS[m.position] || m.position}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Department</span>
                  <span className="text-slate-200">{m.department_name || '—'}</span>
                </div>
                
              </div>
            </div>
          ))}
          {!members.length && <div className="col-span-full card text-center py-12 text-slate-500">No team members found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">{editingId ? 'Edit' : 'Add'} Team Member</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">User ID</label>
                <input type="number" className="input" placeholder="Enter user ID from database" value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))} required />
                <p className="text-xs text-slate-600 mt-1">Check the database for user IDs of members to add</p>
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Position</label>
              <select className="input" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}>
                {POSITIONS.map(p => <option key={p} value={p}>{POSITION_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <select className="input" value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}>
                <option value="">No Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : (editingId ? 'Update' : 'Add Member')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}