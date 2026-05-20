// frontend/src/pages/SuperAdminClubs.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, Building2, Users, DollarSign, Edit, Trash2 } from 'lucide-react';
import { formatINR } from '../utils/format';

export default function SuperAdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'General' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    superadminAPI.getClubs().then(r => setClubs(r.data)).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await superadminAPI.createClub(form);
      setShowModal(false);
      setForm({ name: '', description: '', category: 'General' });
      const r = await superadminAPI.getClubs();
      setClubs(r.data);
    } catch { alert('Failed to create club'); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Club Management</h1>
          <p className="text-slate-400 text-sm">Manage all clubs on the platform</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Club
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <div key={club.id} className="card hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-spark-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {club.name?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">{club.name}</h3>
                    <p className="text-xs text-slate-500">{club.category || 'General'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="text-slate-500 hover:text-spark-400 p-1"><Edit size={14} /></button>
                </div>
              </div>
              {club.description && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{club.description}</p>}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-bold text-slate-200">{club.member_count || 0}</p>
                  <p className="text-slate-500">Members</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-200">{club.team_size || 0}</p>
                  <p className="text-slate-500">Team</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-red-400">{formatINR(club.total_spent || 0)}</p>
                  <p className="text-slate-500">Spent</p>
                </div>
              </div>
            </div>
          ))}
          {!clubs.length && <div className="col-span-full card text-center py-12 text-slate-500">No clubs found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Create New Club</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Club Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option>General</option>
                <option>Technical</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Academic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Club'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}