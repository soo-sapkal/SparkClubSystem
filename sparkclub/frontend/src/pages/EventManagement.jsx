// frontend/src/pages/EventManagement.jsx
import { useEffect, useState } from 'react';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, X, Calendar, Users, DollarSign, Edit3, Trash2 } from 'lucide-react';

const EMPTY_FORM = {
  name: '', description: '', event_type: 'hackathon', status: 'planning',
  start_date: '', end_date: '', venue: '', coordinator_id: '', budget_allocated: '', budget_used: ''
};

const STATUS_COLORS = {
  planning:  'bg-slate-800 text-slate-400',
  active:    'bg-emerald-900/60 text-emerald-300',
  completed: 'bg-blue-900/60 text-blue-300',
  cancelled: 'bg-red-900/60 text-red-300',
};

const TYPE_ICONS = { hackathon: '💻', workshop: '🎓', seminar: '🎙️', cultural: '🎭', sports: '⚽', other: '📋' };

export default function EventManagement() {
  const { isTreasurer, isClubHead, isAdmin } = useAuth();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = isTreasurer || isClubHead || isAdmin;

  function load() {
    eventsAPI.getAll({}).then(r => setEvents(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...EMPTY_FORM, start_date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(ev) {
    setForm({
      name: ev.name, description: ev.description || '', event_type: ev.event_type,
      status: ev.status, start_date: ev.start_date || '', end_date: ev.end_date || '',
      venue: ev.venue || '', coordinator_id: ev.coordinator_id || '', 
      budget_allocated: ev.budget_allocated || '', budget_used: ev.budget_used || ''
    });
    setEditingId(ev.id);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        budget_allocated: Number(form.budget_allocated) || 0,
        budget_used: Number(form.budget_used) || 0,
      };
      if (editingId) {
        await eventsAPI.update(editingId, payload);
      } else {
        await eventsAPI.create(payload);
      }
      setShowModal(false);
      load();
    } catch { alert('Failed to save event'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return;
    await eventsAPI.delete(id);
    load();
  }

  const totalRevenue = events.reduce((s, e) => s + (e.revenue_generated || 0), 0);
  const totalBudgetUsed = events.reduce((s, e) => s + (e.budget_used || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Management</h1>
          <p className="text-slate-400 text-sm">{events.length} events total</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{formatINR(totalRevenue)}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Budget Used</p>
          <p className="text-xl font-bold text-red-400 mt-1">{formatINR(totalBudgetUsed)}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Active Events</p>
          <p className="text-xl font-bold mt-1">{events.filter(e => e.status === 'active').length}</p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map(ev => (
            <div key={ev.id} className="card hover:border-slate-700 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{TYPE_ICONS[ev.event_type] || '📋'}</span>
                    <div>
                      <h3 className="font-semibold text-slate-200">{ev.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(ev)} className="text-slate-500 hover:text-spark-400 p-1"><Edit3 size={13} /></button>
                      <button onClick={() => handleDelete(ev.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
                <p className="text-slate-400 text-xs line-clamp-2">{ev.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  {ev.start_date && <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(ev.start_date)}</span>}
                  {ev.venue && <span>{ev.venue}</span>}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Budget</p>
                  <p className="font-semibold text-slate-200">{formatINR(ev.budget_allocated)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Spent</p>
                  <p className="font-semibold text-red-400">{formatINR(ev.budget_used)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Turnout</p>
                  <p className="font-semibold text-slate-200">{ev.actual_turnout || 0} / {ev.expected_turnout || '?'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Revenue</p>
                  <p className="font-semibold text-emerald-400">{formatINR(ev.revenue_generated)}</p>
                </div>
              </div>
            </div>
          ))}
          {!events.length && <div className="col-span-full card text-center py-12 text-slate-500">No events found</div>}
        </div>
      )}

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">{editingId ? 'Edit' : 'Create'} Event</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Event Name</label>
                <input className="input" placeholder="TechFest 2026" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type</label>
                <select className="input" value={form.event_type} onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))}>
                  {['hackathon','workshop','seminar','cultural','sports','other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['planning','active','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                <input type="date" className="input" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">End Date</label>
                <input type="date" className="input" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Venue</label>
                <input className="input" placeholder="Main Campus" value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Budget Allocated (₹)</label>
                <input type="number" className="input" placeholder="50000" value={form.budget_allocated} onChange={e => setForm(p => ({ ...p, budget_allocated: e.target.value }))} />
              </div>
              {editingId && (
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Spent Amount (₹)</label>
                  <input type="number" className="input" placeholder="Amount spent so far" value={form.budget_used} onChange={e => setForm(p => ({ ...p, budget_used: e.target.value }))} />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea className="input h-20 resize-none" placeholder="Event details..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Event'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}