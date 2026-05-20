// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

function getRedirectForRole(role) {
  const routes = {
    super_admin: '/superadmin/dashboard',
    club_head: '/club-head',
    treasurer: '/dashboard',
    admin: '/dashboard',
    faculty: '/faculty/dashboard',
    faculty_advisor: '/faculty/dashboard',
    faculty_coordinator: '/faculty/dashboard',
    student_head: '/club-head',
    department_lead: '/club-head',
    event_lead: '/club-head',
    member: '/student/dashboard'
  };
  return routes[role] || '/student/dashboard';
}

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
    return data.redirectTo || getRedirectForRole(data.user.role);
  }

  async function signup(formData) {
    const { data } = await authAPI.signup(formData);
    localStorage.setItem('sparkclub_token', data.token);
    localStorage.setItem('sparkclub_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.redirectTo || getRedirectForRole(data.user.role);
  }

  function logout() {
    localStorage.removeItem('sparkclub_token');
    localStorage.removeItem('sparkclub_user');
    setUser(null);
  }

  const isTreasurer = user?.role === 'treasurer' || user?.role === 'admin';
  const isClubHead  = ['club_head', 'student_head', 'department_lead', 'event_lead'].includes(user?.role);
  const isAdmin     = user?.role === 'admin';
  const isMember    = user?.role === 'member';
  const isFaculty   = ['faculty', 'faculty_advisor', 'faculty_coordinator'].includes(user?.role);
  const isStudent   = user?.role === 'member';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, isTreasurer, isClubHead, isAdmin, isMember, isFaculty, isStudent, isSuperAdmin, getRedirectForRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
