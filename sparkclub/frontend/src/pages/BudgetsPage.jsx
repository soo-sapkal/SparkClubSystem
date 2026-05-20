// frontend/src/pages/BudgetsPage.jsx
import { useEffect, useState } from 'react';
import { budgetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit3, X, HelpCircle } from 'lucide-react';

export default function BudgetsPage() {
  const { isTreasurer } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: '', category_id: '', allocated: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [bRes, cRes] = await Promise.all([
        budgetsAPI.getAll(year),
        budgetsAPI.getCategories()
      ]);
      setBudgets(bRes.data);
      setCategories(cRes.data);
    } catch (err) {
      setError('Failed to fetch budget information.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [year]);

  async function handleOpenAdd() {
    setForm({ id: '', category_id: categories[0]?.id || '', allocated: '', notes: '' });
    setShowModal(true);
  }

  async function handleOpenEdit(b) {
    // Find category ID matching category name
    const cat = categories.find(c => c.name === b.category_name);
    setForm({
      id: b.id,
      category_id: cat?.id || '',
      allocated: b.allocated,
      notes: b.notes || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this budget allocation?')) return;
    try {
      await budgetsAPI.delete(id);
      loadData();
    } catch (err) {
      alert('Failed to delete budget.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await budgetsAPI.upsert({
        category_id: Number(form.category_id),
        fiscal_year: Number(year),
        allocated: Number(form.allocated),
        notes: form.notes
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save budget.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-slate-400">Loading Budgets...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-slate-400 text-sm">Allocate and track club funds across custom categories</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input py-1.5 w-32"
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            <option value="2024">FY 2024</option>
            <option value="2025">FY 2025</option>
            <option value="2026">FY 2026</option>
          </select>
          {isTreasurer && (
            <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1">
              <Plus size={16} /> Allocate Budget
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-950/20 border border-red-900 rounded-lg p-4">{error}</div>}

      {/* Grid of Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(b => {
          const utilPct = Math.min(b.utilization_pct || 0, 100);
          const isOver = (b.utilization_pct || 0) > 100;
          return (
            <div key={b.id} className="card flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-200">{b.category_name}</h3>
                      <p className="text-xs text-slate-500">FY {b.fiscal_year}</p>
                    </div>
                  </div>
                  {isTreasurer && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="text-slate-400 hover:text-spark-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Spent: ₹{b.spent.toLocaleString('en-IN')}</span>
                    <span className={isOver ? 'text-red-400' : 'text-slate-300'}>
                      {b.utilization_pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${utilPct}%`,
                        backgroundColor: isOver ? '#ef4444' : (b.color || '#6366f1')
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-500">Total Allocated</p>
                  <p className="font-semibold text-slate-200 text-sm">₹{b.allocated.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Remaining</p>
                  <p className={`font-semibold text-sm ${b.remaining < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                    ₹{b.remaining.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {!budgets.length && (
          <div className="col-span-full card text-center py-12 text-slate-500">
            No budgets allocated for the selected year.
          </div>
        )}
      </div>

      {/* Allocation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">{form.id ? 'Edit' : 'New'} Budget Allocation</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select
                className="input"
                value={form.category_id}
                onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                required
                disabled={!!form.id} // cannot edit category of existing allocation directly
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Allocated Amount (₹)</label>
              <input
                type="number"
                className="input"
                placeholder="25000"
                value={form.allocated}
                onChange={e => setForm(p => ({ ...p, allocated: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Notes</label>
              <textarea
                className="input h-20 resize-none"
                placeholder="Context or details..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Allocation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
