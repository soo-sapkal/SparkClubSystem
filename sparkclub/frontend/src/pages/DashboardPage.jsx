// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, TrendingDown, IndianRupee,
  AlertCircle, Receipt, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data: res } = await dashboardAPI.get();
        setData(res);
      } catch (err) {
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-slate-400">Loading Dashboard...</div>;
  if (error) return <div className="text-red-500 bg-red-950/20 border border-red-900 rounded-lg p-4">{error}</div>;

  const { metrics, recentTransactions, monthlySummary, budgetUtilization } = data;

  const chartData = monthlySummary.map(m => ({
    name: `${m.month}/${m.year.slice(2)}`,
    income: m.total_income,
    expense: m.total_expense
  }));

  const activeBudgets = budgetUtilization.filter(b => b.allocated > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-spark-500/10 text-spark-400 rounded-xl flex items-center justify-center">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Net Balance</p>
            <p className="text-xl font-bold">₹{metrics.netBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Total Income */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Income (YTD)</p>
            <p className="text-xl font-bold text-emerald-400">₹{metrics.totalIncome.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center">
            <TrendingDown size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Expenses (YTD)</p>
            <p className="text-xl font-bold text-red-400">₹{metrics.totalExpense.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Requests</p>
            <p className="text-xl font-bold">{metrics.pendingRequests}</p>
          </div>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="card lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-200">Financial Performance</h3>
          <div className="h-72">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600">No transaction data yet</div>
            )}
          </div>
        </div>

        {/* Budget Utilization Chart */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-200">Budget Utilization</h3>
          <div className="h-72">
            {activeBudgets.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeBudgets} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="category_name" stroke="#64748b" width={80} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="utilization_pct" name="Utilization %" radius={[0, 4, 4, 0]}>
                    {activeBudgets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600">No budget data set</div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Transactions / Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200">Recent Transactions</h3>
            <button className="text-spark-400 hover:text-spark-300 text-xs font-medium flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="py-2">Date</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 text-slate-400">{tx.date}</td>
                    <td className="py-2.5 font-medium max-w-xs truncate">{tx.description}</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span>{tx.icon}</span>
                        <span className="truncate max-w-[120px]">{tx.category_name}</span>
                      </span>
                    </td>
                    <td className={`py-2.5 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tips or category breakdown cards */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-200">Quick Recommendations</h3>
          <div className="space-y-3">
            {activeBudgets.some(b => b.utilization_pct > 80) ? (
              <div className="flex gap-3 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs">
                <AlertCircle className="text-red-400 shrink-0" size={16} />
                <div>
                  <p className="font-semibold text-red-200">Budget Warning</p>
                  <p className="text-slate-400 mt-0.5">Some budget categories are over 80% utilization. Limit non-essential spending.</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs">
                <Receipt className="text-emerald-400 shrink-0" size={16} />
                <div>
                  <p className="font-semibold text-emerald-200">Healthy Finances</p>
                  <p className="text-slate-400 mt-0.5">Budget utilization is well within optimal limits across all active categories.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
