// frontend/src/pages/TransactionsPage.jsx
import { useEffect, useState } from 'react';
import { transactionsAPI, budgetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, Edit3, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TransactionsPage() {
  const { isTreasurer } = useAuth();
  const [txs, setTxs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: '', type: 'expense', amount: '', description: '',
    category_id: '', date: new Date().toISOString().split('T')[0], reference: ''
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories() {
    try {
      const { data } = await budgetsAPI.getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTransactions() {
    setLoading(true);
    try {
      const { data: res } = await transactionsAPI.getAll({
        page, limit, type, category_id: categoryId, search
      });
      setTxs(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [page, type, categoryId, search]);

  function handleOpenAdd() {
    setForm({
      id: '', type: 'expense', amount: '', description: '',
      category_id: categories[0]?.id || '', date: new Date().toISOString().split('T')[0], reference: ''
    });
    setShowModal(true);
  }

  function handleOpenEdit(tx) {
    setForm({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category_id: tx.category_id || '',
      date: tx.date,
      reference: tx.reference || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await transactionsAPI.delete(id);
      loadTransactions();
    } catch (err) {
      alert('Failed to delete transaction.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        category_id: form.category_id ? Number(form.category_id) : null
      };

      if (form.id) {
        await transactionsAPI.update(form.id, payload);
      } else {
        await transactionsAPI.create(payload);
      }
      setShowModal(false);
      loadTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ledger & Transactions</h1>
          <p className="text-slate-400 text-sm">Full transaction audit trail, income records and expenditures</p>
        </div>
        {isTreasurer && (
          <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Record Transaction
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Search description</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              className="input pl-9 py-1.5"
              placeholder="Posters, setup..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Type</label>
          <select
            className="input py-1.5"
            value={type}
            onChange={e => { setType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Category</label>
          <select
            className="input py-1.5"
            value={categoryId}
            onChange={e => { setCategoryId(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { setSearch(''); setType(''); setCategoryId(''); setPage(1); }}
          className="btn-secondary py-2 text-xs"
        >
          Reset Filters
        </button>
      </div>

      {/* Table Card */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/60">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Reference / Bill</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">Amount</th>
                {isTreasurer && <th className="px-5 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {txs.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{tx.date}</td>
                  <td className="px-5 py-3.5 font-medium">
                    <div>{tx.description}</div>
                    <div className="text-[10px] text-slate-500">Recorded by: {tx.recorded_by_name}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                    {tx.reference || '—'}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {tx.category_name ? (
                      <span className="flex items-center gap-1.5">
                        <span>{tx.icon}</span>
                        <span>{tx.category_name}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Uncategorized</span>
                    )}
                  </td>
                  <td className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  {isTreasurer && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="text-slate-400 hover:text-spark-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-10 text-slate-500 bg-slate-900/20">Loading records...</div>
        )}

        {!loading && !txs.length && (
          <div className="text-center py-12 text-slate-500 bg-slate-900/20">No matching transactions found.</div>
        )}

        {/* Pagination bar */}
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 bg-slate-900/30">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-300">{page}</span> of{' '}
            <span className="font-semibold text-slate-300">{totalPages}</span> ({total} total rows)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">{form.id ? 'Edit' : 'Record'} Transaction</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, type: 'expense' }))}
                className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  form.type === 'expense' ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, type: 'income' }))}
                className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  form.type === 'income' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input
                type="text"
                className="input"
                placeholder="Arduino kits, Sponsorship, Refreshments..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="3500"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select
                  className="input"
                  value={form.category_id}
                  onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Reference / Bill #</label>
                <input
                  type="text"
                  className="input"
                  placeholder="BILL-1092"
                  value={form.reference}
                  onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
