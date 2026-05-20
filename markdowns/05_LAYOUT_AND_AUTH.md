# Phase 5 — Layout & Login Page

## Goal
Build the sidebar layout with navigation and the login page.

---

## Step 5.1 — Create `frontend/src/components/layout/Sidebar.jsx`

```jsx
// frontend/src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wallet, ArrowLeftRight,
  FileText, BarChart3, Bot, LogOut, Zap
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/budgets',      icon: Wallet,           label: 'Budgets' },
  { to: '/transactions', icon: ArrowLeftRight,   label: 'Transactions' },
  { to: '/funding',      icon: FileText,         label: 'Funding' },
  { to: '/reports',      icon: BarChart3,        label: 'Reports' },
  { to: '/ai',           icon: Bot,              label: 'AI Assistant' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-spark-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SparkClub</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 ml-10">Treasurer Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-spark-500/20 text-spark-400 border border-spark-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User area */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-spark-600 rounded-full flex items-center justify-center text-xs font-bold">
            {user?.avatar || user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
```

---

## Step 5.2 — Update `frontend/src/components/layout/Layout.jsx`

```jsx
// frontend/src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## Step 5.3 — Create `frontend/src/pages/LoginPage.jsx`

```jsx
// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-spark-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-spark-500 rounded-2xl mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">SparkClub</h1>
          <p className="text-slate-400 text-sm mt-1">Treasurer Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold">Sign in to your account</h2>

          {error && (
            <div className="bg-red-900/40 border border-red-800 rounded-lg px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              className="input"
              placeholder="arjun@sparkclub.edu"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Demo: arjun@sparkclub.edu / password123
          </p>
        </form>
      </div>
    </div>
  );
}
```

---

## Checkpoint ✅
After Phase 5:
- Login page renders at `/login`
- Successful login redirects to `/dashboard`
- Sidebar shows with all nav links
- Layout wraps pages correctly
