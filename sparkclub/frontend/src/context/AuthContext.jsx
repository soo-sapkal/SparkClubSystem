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
    return data.redirectTo || (data.user.role === 'club_head' ? '/club-head' : '/dashboard');
  }

  function logout() {
    localStorage.removeItem('sparkclub_token');
    localStorage.removeItem('sparkclub_user');
    setUser(null);
  }

  const isTreasurer = user?.role === 'treasurer' || user?.role === 'admin';
  const isClubHead  = user?.role === 'club_head';
  const isAdmin     = user?.role === 'admin';
  const isMember    = user?.role === 'member';
  const isFaculty   = user?.role === 'faculty';
  const isStudent   = user?.role === 'member';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isTreasurer, isClubHead, isAdmin, isMember, isFaculty, isStudent, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
