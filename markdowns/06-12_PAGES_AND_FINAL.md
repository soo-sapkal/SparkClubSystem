# Phase 6 — Dashboard Page

## Goal
Build the main dashboard with metric cards, line chart (monthly), bar chart (budget utilization), and recent transactions table.

---

## Step 6.1 — Shared UI Components

Create `frontend/src/components/ui/StatCard.jsx`:
```jsx
export default function StatCard({ label, value, sub, icon: Icon, color = 'spark', trend }) {
  const colors = {
    spark:   'bg-spark-500/10 text-spark-400 border-spark-500/20',
    green:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red:     'bg-red-500/10 text-red-400 border-red-500/20',
    yellow:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return (
    <div className="card flex items-start gap-4">
      {Icon && (
        <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold mt-0.5 font-mono">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
```

Create `frontend/src/components/ui/LoadingSpinner.jsx`:
```jsx
export default function LoadingSpinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        style={{ width: size, height: size }}
        className="border-2 border-spark-500/30 border-t-spark-500 rounded-full animate-spin"
      />
    </div>
  );
}
```

Create `frontend/src/utils/format.js`:
```javascript
export function formatINR(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
```

---

## Step 6.2 — Create `frontend/src/pages/DashboardPage.jsx`

```jsx
// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatINR, formatDate, MONTH_NAMES } from '../utils/format';
import { TrendingUp, TrendingDown, Wallet, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatINR(p.value)}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)   return <p className="text-red-400">Failed to load dashboard.</p>;

  const { metrics, recentTransactions, monthlySummary, budgetUtilization } = data;

  const monthlyChartData = monthlySummary.map(m => ({
    month: MONTH_NAMES[Number(m.month) - 1],
    Income: m.total_income,
    Expenses: m.total_expense,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">FY{new Date().getFullYear()} financial overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income"     value={formatINR(metrics.totalIncome)}    icon={TrendingUp}   color="green"  />
        <StatCard label="Total Expenses"   value={formatINR(metrics.totalExpense)}   icon={TrendingDown} color="red"    />
        <StatCard label="Net Balance"      value={formatINR(metrics.netBalance)}     icon={Wallet}       color="spark"  sub={`Budget remaining: ${formatINR(metrics.budgetRemaining)}`} />
        <StatCard label="Pending Requests" value={metrics.pendingRequests}           icon={Clock}        color="yellow" sub="Awaiting review" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Monthly Line Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">Monthly Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Income"   stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Utilization Bar Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">Budget Utilization</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetUtilization} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="category_name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
              <Tooltip formatter={(v) => [`${v}%`, 'Utilized']} contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="utilization_pct" radius={[0, 4, 4, 0]}>
                {budgetUtilization.map((entry, i) => (
                  <Cell key={i} fill={entry.utilization_pct > 85 ? '#ef4444' : entry.utilization_pct > 60 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {recentTransactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${tx.type === 'income' ? 'bg-emerald-900/50' : 'bg-red-900/50'}`}>
                {tx.type === 'income' ? <ArrowUpRight size={16} className="text-emerald-400" /> : <ArrowDownRight size={16} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <p className="text-xs text-slate-500">{tx.icon} {tx.category_name} · {formatDate(tx.date)}</p>
              </div>
              <p className={`text-sm font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Checkpoint ✅ Phase 6
Dashboard shows 4 metric cards, line chart, bar chart, recent transactions table.

---

# Phase 7 — Budgets Page

## Step 7.1 — `frontend/src/pages/BudgetsPage.jsx`

```jsx
// frontend/src/pages/BudgetsPage.jsx
import { useEffect, useState } from 'react';
import { budgetsAPI } from '../services/api';
import { formatINR } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { PencilLine, Save, X } from 'lucide-react';

export default function BudgetsPage() {
  const { isTreasurer } = useAuth();
  const [budgets, setBudgets]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editId, setEditId]       = useState(null);
  const [editVal, setEditVal]     = useState('');
  const [saving, setSaving]       = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    Promise.all([budgetsAPI.getAll(year), budgetsAPI.getCategories()])
      .then(([b, c]) => { setBudgets(b.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(budget) {
    setSaving(true);
    await budgetsAPI.upsert({ category_id: budget.id, fiscal_year: year, allocated: Number(editVal) });
    const refreshed = await budgetsAPI.getAll(year);
    setBudgets(refreshed.data);
    setEditId(null);
    setSaving(false);
  }

  if (loading) return <LoadingSpinner />;

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent     = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Budget Management</h1>
        <p className="text-slate-400 text-sm mt-1">FY{year} — allocate and track category budgets</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Allocated', value: formatINR(totalAllocated), color: 'text-spark-400' },
          { label: 'Total Spent',     value: formatINR(totalSpent),     color: 'text-red-400' },
          { label: 'Remaining',       value: formatINR(totalAllocated - totalSpent), color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-slate-400 text-sm">{s.label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Budget Table */}
      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-800">
              <th className="pb-3 text-slate-400 font-medium">Category</th>
              <th className="pb-3 text-slate-400 font-medium text-right">Allocated</th>
              <th className="pb-3 text-slate-400 font-medium text-right">Spent</th>
              <th className="pb-3 text-slate-400 font-medium text-right">Remaining</th>
              <th className="pb-3 text-slate-400 font-medium">Utilization</th>
              {isTreasurer && <th className="pb-3 text-slate-400 font-medium text-right">Edit</th>}
            </tr>
          </thead>
          <tbody>
            {budgets.map(b => (
              <tr key={b.id} className="border-b border-slate-800/50 last:border-0">
                <td className="py-3">
                  <span className="mr-2">{b.icon}</span>
                  <span>{b.category_name}</span>
                </td>
                <td className="py-3 text-right font-mono">
                  {editId === b.id ? (
                    <input
                      type="number"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      className="input w-28 text-right"
                    />
                  ) : formatINR(b.allocated)}
                </td>
                <td className="py-3 text-right font-mono text-red-400">{formatINR(b.spent)}</td>
                <td className={`py-3 text-right font-mono ${b.remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatINR(b.remaining)}
                </td>
                <td className="py-3 w-40">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${b.utilization_pct > 85 ? 'bg-red-500' : b.utilization_pct > 60 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(b.utilization_pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{b.utilization_pct}%</span>
                  </div>
                </td>
                {isTreasurer && (
                  <td className="py-3 text-right">
                    {editId === b.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleSave(b)} disabled={saving} className="p-1 text-emerald-400 hover:text-emerald-300"><Save size={15} /></button>
                        <button onClick={() => setEditId(null)} className="p-1 text-slate-400 hover:text-slate-200"><X size={15} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditId(b.id); setEditVal(b.allocated); }} className="p-1 text-slate-400 hover:text-slate-200">
                        <PencilLine size={15} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Checkpoint ✅ Phase 7
Budgets page shows category-wise allocation table with inline editing and utilization bars.

---

# Phase 8 — Transactions Page

## Step 8.1 — `frontend/src/pages/TransactionsPage.jsx`

```jsx
// frontend/src/pages/TransactionsPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { transactionsAPI, budgetsAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, ChevronLeft, ChevronRight, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const EMPTY_FORM = { type: 'expense', amount: '', description: '', category_id: '', date: new Date().toISOString().split('T')[0], reference: '' };

export default function TransactionsPage() {
  const { isTreasurer } = useAuth();
  const [data, setData]         = useState({ data: [], total: 0 });
  const [categories, setCats]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [filters, setFilters]   = useState({ search: '', type: '', category_id: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [submitting, setSub]    = useState(false);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    transactionsAPI.getAll({ page, limit: LIMIT, ...filters })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { budgetsAPI.getCategories().then(r => setCats(r.data)); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSub(true);
    try {
      await transactionsAPI.create({ ...form, amount: Number(form.amount) });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } finally {
      setSub(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    await transactionsAPI.delete(id);
    load();
  }

  const totalPages = Math.ceil(data.total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">{data.total} records total</p>
        </div>
        {isTreasurer && (
          <button onClick={() => setShowForm(p => !p)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Transaction
          </button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold">New Transaction</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
              <input type="number" className="input" placeholder="5000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input type="text" className="input" placeholder="Workshop venue booking" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select className="input" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                <option value="">— None —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Reference #</label>
              <input type="text" className="input" placeholder="INV-001" value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save Transaction'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search transactions…" value={filters.search}
            onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setPage(1); }} />
        </div>
        <select className="input w-36" value={filters.type} onChange={e => { setFilters(p => ({ ...p, type: e.target.value })); setPage(1); }}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="input w-48" value={filters.category_id} onChange={e => { setFilters(p => ({ ...p, category_id: e.target.value })); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800">
                {['Date','Description','Category','Type','Amount','Ref',''].map(h => (
                  <th key={h} className="pb-3 text-slate-400 font-medium pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map(tx => (
                <tr key={tx.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/30">
                  <td className="py-2.5 pr-4 text-slate-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                  <td className="py-2.5 pr-4 max-w-xs truncate">{tx.description}</td>
                  <td className="py-2.5 pr-4 text-slate-400 whitespace-nowrap">{tx.icon} {tx.category_name || '—'}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`flex items-center gap-1 text-xs font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {tx.type}
                    </span>
                  </td>
                  <td className={`py-2.5 pr-4 font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs">{tx.reference || '—'}</td>
                  <td className="py-2.5">
                    {isTreasurer && (
                      <button onClick={() => handleDelete(tx.id)} className="text-slate-600 hover:text-red-400 p-1">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-2"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary py-1.5 px-2"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Checkpoint ✅ Phase 8
Transactions page: paginated table, search + filters, add form, delete. All CRUD via API.

---

# Phase 9 — Funding Requests Page

## Step 9.1 — `frontend/src/pages/FundingPage.jsx`

```jsx
// frontend/src/pages/FundingPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { fundingAPI, budgetsAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Plus, ChevronDown, ChevronUp, Check, X, Clock, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      class: 'badge-pending',      icon: Clock },
  approved:     { label: 'Approved',     class: 'badge-approved',     icon: Check },
  rejected:     { label: 'Rejected',     class: 'badge-rejected',     icon: X },
  under_review: { label: 'Under Review', class: 'badge-under_review', icon: AlertCircle },
};

const PRIORITY_COLORS = {
  low: 'text-slate-400', medium: 'text-blue-400', high: 'text-yellow-400', urgent: 'text-red-400'
};

const EMPTY_FORM = { title: '', description: '', amount: '', category_id: '', priority: 'medium', event_date: '' };

export default function FundingPage() {
  const { user, isTreasurer } = useAuth();
  const [requests, setRequests] = useState([]);
  const [categories, setCats]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState(null);
  const [reviewForm, setReviewForm] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fundingAPI.getAll(statusFilter ? { status: statusFilter } : {})
      .then(r => setRequests(r.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { budgetsAPI.getCategories().then(r => setCats(r.data)); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await fundingAPI.create({ ...form, amount: Number(form.amount) });
    setShowForm(false);
    setForm(EMPTY_FORM);
    load();
  }

  async function handleReview(id, status) {
    const note = reviewForm[id] || '';
    await fundingAPI.review(id, status, note);
    load();
  }

  const counts = {
    pending:      requests.filter(r => r.status === 'pending').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    approved:     requests.filter(r => r.status === 'approved').length,
    rejected:     requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funding Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Submit, review and track budget requests</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['', 'All', requests.length], ...Object.entries(counts).map(([k, v]) => [k, STATUS_CONFIG[k]?.label, v])].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === val ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {label} <span className="ml-1 text-xs opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* New Request Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold">New Funding Request</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Title</label>
              <input className="input" placeholder="HackVerse 2025 Participation" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea className="input h-20 resize-none" placeholder="Detailed justification…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount Requested (₹)</label>
              <input type="number" className="input" placeholder="15000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select className="input" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Event Date (optional)</label>
              <input type="date" className="input" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Submit Request</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Requests List */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {requests.map(r => {
            const StatusIcon = STATUS_CONFIG[r.status]?.icon || Clock;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="card">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge-${r.status}`}>
                        <StatusIcon size={10} className="inline mr-1" />{STATUS_CONFIG[r.status]?.label}
                      </span>
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[r.priority]}`}>
                        ● {r.priority}
                      </span>
                      {r.category_name && <span className="text-xs text-slate-500">{r.category_icon} {r.category_name}</span>}
                    </div>
                    <p className="font-medium mt-1">{r.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      By {r.requested_by_name} · {formatDate(r.submitted_at)}
                      {r.event_date && ` · Event: ${formatDate(r.event_date)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-spark-400">{formatINR(r.amount)}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    {r.description && <p className="text-sm text-slate-300">{r.description}</p>}
                    {r.reviewer_note && (
                      <div className="bg-slate-800/60 rounded-lg p-3 text-sm">
                        <p className="text-slate-400 text-xs mb-1">Reviewer Note ({r.reviewed_by_name})</p>
                        <p>{r.reviewer_note}</p>
                      </div>
                    )}

                    {isTreasurer && r.status !== 'approved' && r.status !== 'rejected' && (
                      <div className="space-y-2">
                        <textarea
                          className="input h-16 resize-none text-sm"
                          placeholder="Reviewer note (optional)…"
                          value={reviewForm[r.id] || ''}
                          onChange={e => setReviewForm(p => ({ ...p, [r.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleReview(r.id, 'approved')} className="btn-primary text-sm py-1.5">✓ Approve</button>
                          <button onClick={() => handleReview(r.id, 'rejected')} className="btn-danger text-sm py-1.5">✗ Reject</button>
                          <button onClick={() => handleReview(r.id, 'under_review')} className="btn-secondary text-sm py-1.5">Mark Under Review</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {requests.length === 0 && <p className="text-slate-500 text-center py-8">No funding requests found.</p>}
        </div>
      )}
    </div>
  );
}
```

---

## Checkpoint ✅ Phase 9
Funding page: submit requests, expand to view details, treasurer can approve/reject/review.

---

# Phase 10 — Reports Page

## Step 10.1 — `frontend/src/pages/ReportsPage.jsx`

```jsx
// frontend/src/pages/ReportsPage.jsx
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { reportsAPI } from '../services/api';
import { formatINR, MONTH_NAMES } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const year = new Date().getFullYear();
  const [breakdown, setBreakdown] = useState([]);
  const [monthly, setMonthly]     = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      reportsAPI.expenseBreakdown(year),
      reportsAPI.monthly(year),
      reportsAPI.summary(year),
    ]).then(([b, m, s]) => {
      setBreakdown(b.data.filter(d => d.total > 0));
      setMonthly(m.data.map(r => ({ ...r, month: MONTH_NAMES[Number(r.month) - 1] })));
      setSummary(s.data);
    }).finally(() => setLoading(false));
  }, []);

  async function exportExcel() {
    const { data: rows } = await reportsAPI.export({ year });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `SparkClub_Transactions_${year}.xlsx`);
  }

  function exportPDF() {
    if (!summary) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SparkClub Financial Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Fiscal Year: ${year}`, 20, 32);
    doc.setFontSize(11);
    let y = 50;
    const lines = [
      `Total Income:   ${formatINR(summary.totalIncome)}`,
      `Total Expenses: ${formatINR(summary.totalExpense)}`,
      `Net Balance:    ${formatINR(summary.netBalance)}`,
      `Total Budget:   ${formatINR(summary.totalBudget)}`,
      `Transactions:   ${summary.transactions}`,
    ];
    lines.forEach(l => { doc.text(l, 20, y); y += 10; });
    y += 10;
    doc.setFontSize(13);
    doc.text('Budget Utilization by Category', 20, y);
    y += 10;
    doc.setFontSize(10);
    summary.budgetUtilization.forEach(b => {
      doc.text(`${b.category_name}: ${formatINR(b.spent)} / ${formatINR(b.allocated)} (${b.utilization_pct}%)`, 20, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save(`SparkClub_Report_${year}.pdf`);
  }

  if (loading) return <LoadingSpinner />;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
        <p style={{ color: payload[0].payload.color }}>{payload[0].name}: {formatINR(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-slate-400 text-sm mt-1">FY{year} analysis and exports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="btn-secondary flex items-center gap-2 text-sm">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={exportPDF} className="btn-secondary flex items-center gap-2 text-sm">
            <FileText size={15} /> PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total Income',   value: formatINR(summary.totalIncome),   color: 'text-emerald-400' },
            { label: 'Total Expenses', value: formatINR(summary.totalExpense),  color: 'text-red-400' },
            { label: 'Net Balance',    value: formatINR(summary.netBalance),    color: 'text-spark-400' },
            { label: 'Transactions',   value: summary.transactions,             color: 'text-slate-200' },
          ].map(s => (
            <div key={s.label} className="card">
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className={`text-xl font-bold font-mono mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={breakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category, percent }) => `${category} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {breakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Monthly Cash Flow</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="total_income"  name="Income"   fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="total_expense" name="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

---

## Checkpoint ✅ Phase 10
Reports page: pie chart, monthly bar chart, PDF export, Excel export.

---

# Phase 11 — Final Wiring & Run Instructions

## Step 12.1 — Environment Files

`backend/.env`:
```env
PORT=3001
JWT_SECRET=sparkclub_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

`frontend/.env`:
```env
VITE_API_URL=/api
```

---

## Step 12.2 — Root `package.json` (Optional Convenience)

Create `sparkclub/package.json`:
```json
{
  "name": "sparkclub",
  "scripts": {
    "backend": "cd backend && npm run dev",
    "frontend": "cd frontend && npm run dev",
    "install:all": "cd backend && npm install && cd ../frontend && npm install",
    "seed": "cd backend && node -e \"require('./db/database').initializeDb()\""
  }
}
```

---

## Step 12.3 — Final File Check

Before running, verify these files exist:
```
backend/
  .env                          ✅
  server.js                     ✅
  db/database.js                ✅
  db/schema.sql                 ✅
  middleware/auth.js            ✅
  routes/auth.js                ✅
  routes/dashboard.js           ✅
  routes/budgets.js             ✅
  routes/transactions.js        ✅
  routes/funding.js             ✅
  routes/reports.js             ✅

frontend/src/
  main.jsx                      ✅
  App.jsx                       ✅
  index.css                     ✅
  context/AuthContext.jsx        ✅
  services/api.js               ✅
  utils/format.js               ✅
  components/layout/Layout.jsx  ✅
  components/layout/Sidebar.jsx ✅
  components/ui/StatCard.jsx     ✅
  components/ui/LoadingSpinner.jsx ✅
  pages/LoginPage.jsx            ✅
  pages/DashboardPage.jsx        ✅
  pages/BudgetsPage.jsx          ✅
  pages/TransactionsPage.jsx      ✅
  pages/FundingPage.jsx          ✅
  pages/ReportsPage.jsx          ✅
```

---

## Step 12.4 — Run the App

Terminal 1 (backend):
```bash
cd sparkclub/backend
npm run dev
# → API running on http://localhost:3001
```

Terminal 2 (frontend):
```bash
cd sparkclub/frontend
npm run dev
# → App running on http://localhost:5173
```

Open `http://localhost:5173` and log in:
- **Email:** `arjun@sparkclub.edu`
- **Password:** `password123`

---

## Step 12.5 — Seed a Fresh Database Anytime

```bash
cd sparkclub/backend
rm -f db/sparkclub.db
node -e "require('./db/database').initializeDb()"
# → ✅ Database initialized from schema.sql
```

This recreates the entire database from `schema.sql` including all seed data.

---

## Step 12.6 — Production Checklist

- [ ] Change `JWT_SECRET` to a random 64-char string
- [ ] Store secrets securely (never commit to git)
- [ ] Add `db/sparkclub.db` to `.gitignore` (commit `schema.sql` only)
- [ ] Add rate limiting: `npm install express-rate-limit`
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`

---

## Final Checkpoint ✅
Complete app is running with:
- Auth (login/logout, JWT)
- Dashboard (metrics, charts)
- Budget management (inline edit)
- Transaction CRUD (paginated, filtered)
- Funding requests (submit, review, approve/reject)
- Reports (pie chart, bar chart, PDF export, Excel export)
- Event management, tasks, sponsors, documents
- Single `schema.sql` seed file for portable database
