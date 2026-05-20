// frontend/src/pages/FacultyFinancials.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { DollarSign, TrendingUp, PieChart, Users } from 'lucide-react';

export default function FacultyFinancials() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [filters, setFilters] = useState({ start_date: '', end_date: '', category: '' });

  useEffect(() => {
    facultyAPI.getFinancials(filters)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Oversight</h1>
          <p className="text-slate-400 text-sm">Detailed view of club finances</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <input type="date" className="input" value={filters.start_date}
            onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} />
          <span className="text-slate-500">to</span>
          <input type="date" className="input" value={filters.end_date}
            onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'transactions', 'budgets', 'vendors'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Category Breakdown
            </h3>
            <div className="space-y-3">
              {data.categoryBreakdown?.map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="text-slate-400">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 rounded-full h-2">
                      <div className="h-2 rounded-full bg-spark-500" style={{ width: `${Math.min((cat.spent / (data.categoryBreakdown?.[0]?.spent || 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-mono text-slate-300">{formatINR(cat.spent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Monthly Trend
            </h3>
            <div className="space-y-3">
              {data.monthlyTrend?.map(m => (
                <div key={m.month} className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                  <span className="text-slate-400 text-sm">{m.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-emerald-400">+{formatINR(m.income)}</span>
                    <span className="text-red-400">-{formatINR(m.expenses)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Spending */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Department Spending
            </h3>
            <div className="space-y-3">
              {data.departmentSpending?.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="text-slate-400">{d.name}</span>
                  <span className={`font-mono ${d.spent > 0 ? 'text-red-400' : 'text-slate-500'}`}>{formatINR(d.spent)}</span>
                </div>
              ))}
              {!data.departmentSpending?.length && <p className="text-slate-500 text-sm">No department data</p>}
            </div>
          </div>

          {/* Budget Tracking */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Budget Tracking
            </h3>
            <div className="space-y-3">
              {data.budgetTracking?.slice(0, 6).map(b => (
                <div key={b.id} className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                  <div>
                    <span className="text-slate-300 text-sm">{b.category_name}</span>
                    <span className="text-slate-500 text-xs ml-2">{b.fiscal_year}{b.month ? `-${b.month}` : ''}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Spent: {formatINR(b.spent)} / {formatINR(b.allocated)}</span>
                    {b.spent > b.allocated && <span className="block text-xs text-red-400">⚠️ Over budget</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="pb-3">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Recorded By</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.transactions?.map(t => (
                <tr key={t.id} className="hover:bg-slate-900/30">
                  <td className="py-3 text-slate-400">{formatDate(t.date)}</td>
                  <td className="py-3 text-slate-300">{t.description}</td>
                  <td className="py-3 text-slate-400">{t.category_name || '—'}</td>
                  <td className="py-3 text-slate-400">{t.recorded_by_name || '—'}</td>
                  <td className={`py-3 text-right font-mono ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === 'income' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'}`}>
                      {t.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.transactions?.length && <p className="text-center py-8 text-slate-500">No transactions found</p>}
        </div>
      )}

      {/* Vendors Tab */}
      {tab === 'vendors' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="pb-3">Vendor</th>
                <th className="pb-3 text-right">Total Paid</th>
                <th className="pb-3 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.vendorPayments?.map((v, i) => (
                <tr key={i} className="hover:bg-slate-900/30">
                  <td className="py-3 text-slate-300">{v.vendor}</td>
                  <td className="py-3 text-right font-mono text-red-400">{formatINR(v.total)}</td>
                  <td className="py-3 text-right text-slate-400">{v.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.vendorPayments?.length && <p className="text-center py-8 text-slate-500">No vendor data</p>}
        </div>
      )}

      {/* Budgets Tab - Simple List */}
      {tab === 'budgets' && (
        <div className="space-y-4">
          {data?.budgetTracking?.map(b => (
            <div key={b.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-200">{b.category_name}</h3>
                  <p className="text-xs text-slate-500">FY {b.fiscal_year}{b.month ? ` Month ${b.month}` : ' (Annual)'}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono ${b.spent > b.allocated ? 'text-red-400' : 'text-slate-300'}`}>
                    {formatINR(b.spent)} / {formatINR(b.allocated)}
                  </p>
                  {b.spent > b.allocated && <span className="text-xs text-red-400">⚠️ Over budget</span>}
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${b.spent > b.allocated ? 'bg-red-500' : 'bg-spark-500'}`} 
                  style={{ width: `${Math.min((b.spent / b.allocated) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}