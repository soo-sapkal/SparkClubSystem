// frontend/src/pages/TasksPage.jsx
import { useEffect, useState } from 'react';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, X, GripVertical } from 'lucide-react';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'border-slate-700' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-800' },
  { id: 'blocked',     label: 'Blocked',     color: 'border-red-800' },
  { id: 'review',     label: 'Review',      color: 'border-yellow-800' },
  { id: 'completed',  label: 'Completed',   color: 'border-emerald-800' },
];

const PRIORITY_COLORS = {
  urgent: 'text-red-400 border-red-800 bg-red-950/20',
  high:   'text-orange-400 border-orange-800 bg-orange-950/20',
  medium: 'text-blue-400 border-blue-800 bg-blue-950/20',
  low:    'text-slate-500 border-slate-700',
};

const EMPTY_FORM = { title: '', description: '', assigned_to: '', priority: 'medium', deadline: '', status: 'todo' };

export default function TasksPage() {
  const { isTreasurer, isClubHead, isAdmin } = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const canCreate = isTreasurer || isClubHead || isAdmin;

  const load = () => {
    tasksAPI.getAll({}).then(r => setTasks(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleStatusChange(taskId, newStatus) {
    await tasksAPI.update(taskId, { status: newStatus });
    load();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await tasksAPI.create({ ...form, assigned_to: form.assigned_to || null });
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch { alert('Failed to create task'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    await tasksAPI.delete(id);
    load();
  }

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-slate-400 text-sm">{tasks.length} tasks across {COLUMNS.length} stages</p>
        </div>
        {canCreate && (
          <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-5 gap-4 overflow-x-auto">
          {COLUMNS.map(col => (
            <div key={col.id} className={`min-w-[220px]`}>
              <div className={`border-t-2 ${col.color} rounded-t-lg bg-slate-900 px-3 py-2 flex items-center justify-between`}>
                <span className="text-sm font-semibold text-slate-300">{col.label}</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{tasksByColumn[col.id]?.length || 0}</span>
              </div>
              <div className="bg-slate-950/50 border border-t-0 border-slate-800 rounded-b-lg p-2 space-y-2 min-h-[200px]">
                {tasksByColumn[col.id].map(task => (
                  <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200 leading-tight">{task.title}</p>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                    {task.event_name && <p className="text-[10px] text-spark-400 mt-1">📅 {task.event_name}</p>}
                    {task.assigned_to_name && <p className="text-[10px] text-slate-500 mt-1">→ {task.assigned_to_name}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      {task.deadline && <span className="text-[10px] text-slate-600">{task.deadline}</span>}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      {canCreate && (
                        <>
                          <select
                            value={task.status}
                            onChange={e => handleStatusChange(task.id, e.target.value)}
                            className="text-[10px] bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-400"
                          >
                            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                          <button onClick={() => handleDelete(task.id)} className="text-slate-600 hover:text-red-400 p-0.5"><X size={12} /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">New Task</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Title</label>
              <input className="input" placeholder="Set up judge panel" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea className="input h-20 resize-none" placeholder="Task details..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Priority</label>
                <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Deadline</label>
                <input type="date" className="input" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Task'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}