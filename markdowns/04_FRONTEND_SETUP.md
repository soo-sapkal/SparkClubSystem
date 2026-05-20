# Phase 4 — Frontend Setup

## Goal
Bootstrap the React + Vite frontend with Tailwind CSS, React Router, global context for auth, and a centralized API service layer that all components will use.

---

## Step 4.1 — Scaffold Frontend

```bash
cd sparkclub
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom recharts axios lucide-react jspdf xlsx
```

---

## Step 4.2 — Configure Tailwind

Replace `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spark: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          500: '#4f6ef7',
          600: '#3b55e6',
          700: '#2d43c7',
          900: '#1a2875',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
```

Replace `frontend/src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-950 text-slate-100 antialiased;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-slate-900; }
  ::-webkit-scrollbar-thumb { @apply bg-slate-700 rounded-full; }
}

@layer components {
  .card {
    @apply bg-slate-900 border border-slate-800 rounded-xl p-5;
  }
  .btn-primary {
    @apply bg-spark-500 hover:bg-spark-600 text-white px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .btn-secondary {
    @apply bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .btn-danger {
    @apply bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .input {
    @apply bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 
           placeholder-slate-500 focus:outline-none focus:border-spark-500 focus:ring-1 focus:ring-spark-500 w-full;
  }
  .badge-pending     { @apply text-xs px-2 py-0.5 rounded-full bg-yellow-900/60 text-yellow-300 border border-yellow-800; }
  .badge-approved    { @apply text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-800; }
  .badge-rejected    { @apply text-xs px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 border border-red-800; }
  .badge-under_review{ @apply text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-800; }
}
```

---

## Step 4.3 — Create API Service Layer

Create `frontend/src/services/api.js`:
```javascript
// frontend/src/services/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sparkclub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sparkclub_token');
      localStorage.removeItem('sparkclub_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (data) =>           api.post('/auth/register', data),
  me:       () =>               api.get('/auth/me'),
};

// ── Dashboard ─────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// ── Budgets ───────────────────────────────────────────────
export const budgetsAPI = {
  getAll:       (year) =>    api.get('/budgets', { params: { year } }),
  getCategories: () =>       api.get('/budgets/categories'),
  upsert:       (data) =>    api.post('/budgets', data),
  delete:       (id) =>      api.delete(`/budgets/${id}`),
};

// ── Transactions ──────────────────────────────────────────
export const transactionsAPI = {
  getAll:  (params) =>     api.get('/transactions', { params }),
  getById: (id) =>         api.get(`/transactions/${id}`),
  create:  (data) =>       api.post('/transactions', data),
  update:  (id, data) =>   api.put(`/transactions/${id}`, data),
  delete:  (id) =>         api.delete(`/transactions/${id}`),
};

// ── Funding ───────────────────────────────────────────────
export const fundingAPI = {
  getAll:  (params) =>            api.get('/funding', { params }),
  getById: (id) =>                api.get(`/funding/${id}`),
  create:  (data) =>              api.post('/funding', data),
  review:  (id, status, note) =>  api.patch(`/funding/${id}/review`, { status, reviewer_note: note }),
  delete:  (id) =>                api.delete(`/funding/${id}`),
};

// ── Reports ───────────────────────────────────────────────
export const reportsAPI = {
  expenseBreakdown: (year) =>        api.get('/reports/expense-breakdown', { params: { year } }),
  monthly:          (year) =>        api.get('/reports/monthly', { params: { year } }),
  export:           (params) =>      api.get('/reports/transactions-export', { params }),
  summary:          (year) =>        api.get('/reports/summary', { params: { year } }),
};

// ── AI ────────────────────────────────────────────────────
export const aiAPI = {
  chat:        (message, history) => api.post('/ai/chat', { message, history }),
  suggestions: () =>                 api.get('/ai/suggestions'),
};

export default api;
```

---

## Step 4.4 — Auth Context

Create `frontend/src/context/AuthContext.jsx`:
```jsx
// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sparkclub_user');
    const token  = localStorage.getItem('sparkclub_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem('sparkclub_token', data.token);
    localStorage.setItem('sparkclub_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('sparkclub_token');
    localStorage.removeItem('sparkclub_user');
    setUser(null);
  }

  const isTreasurer = user?.role === 'treasurer' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isTreasurer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

---

## Step 4.5 — Router Setup

Replace `frontend/src/main.jsx`:
```jsx
// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

Replace `frontend/src/App.jsx`:
```jsx
// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import BudgetsPage     from './pages/BudgetsPage';
import TransactionsPage from './pages/TransactionsPage';
import FundingPage     from './pages/FundingPage';
import ReportsPage     from './pages/ReportsPage';
import AIAssistantPage from './pages/AIAssistantPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="budgets"      element={<BudgetsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="funding"      element={<FundingPage />} />
        <Route path="reports"      element={<ReportsPage />} />
        <Route path="ai"           element={<AIAssistantPage />} />
      </Route>
    </Routes>
  );
}
```

---

## Step 4.6 — Vite Proxy Config

Create `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

Now update `frontend/src/services/api.js` base URL:
```javascript
const BASE_URL = '/api'; // Use Vite proxy in dev
```

---

## Step 4.7 — Create Stub Pages (so app doesn't crash)

Create each page file with a minimal stub. The full implementation comes in later phases.

```bash
mkdir -p frontend/src/pages frontend/src/components/layout
```

Create `frontend/src/pages/LoginPage.jsx` (stub):
```jsx
export default function LoginPage() {
  return <div className="flex items-center justify-center h-screen">Login Page — Phase 5</div>;
}
```

Create stubs for: `DashboardPage.jsx`, `BudgetsPage.jsx`, `TransactionsPage.jsx`, `FundingPage.jsx`, `ReportsPage.jsx`, `AIAssistantPage.jsx` — all identical to the Login stub with their own label.

Create `frontend/src/components/layout/Layout.jsx` (stub):
```jsx
import { Outlet } from 'react-router-dom';
export default function Layout() {
  return (
    <div>
      <main><Outlet /></main>
    </div>
  );
}
```

---

## Step 4.8 — Start Frontend

```bash
cd sparkclub/frontend
npm run dev
# → http://localhost:5173
```

---

## Checkpoint ✅
After this phase:
- `npm run dev` starts without errors
- Tailwind styles load (dark background)
- API service layer (`api.js`) is in place with all endpoints defined
- Auth context handles login/logout/persist
- Routing structure is in place (all pages stub)
- Vite proxy routes `/api/*` → `localhost:3001`
