// frontend/src/pages/StudentProfile.jsx
import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { User, Mail, Calendar, Award, Droplet, GraduationCap } from 'lucide-react';

export default function StudentProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    prn: '',
    blood_group: '',
    batch: '',
    department: ''
  });

  useEffect(() => {
    studentAPI.getProfile()
      .then(r => {
        setProfile(r.data);
        setForm({
          name: r.data.name || '',
          prn: r.data.prn || '',
          blood_group: r.data.blood_group || '',
          batch: r.data.batch || '',
          department: r.data.department || ''
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    await studentAPI.updateProfile(form);
    setEditing(false);
    setProfile(p => ({ ...p, ...form }));
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-slate-400 text-sm">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-spark-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {profile?.avatar_initials || profile?.name?.[0] || 'U'}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <input className="input" placeholder="PRN" value={form.prn} onChange={e => setForm(f => ({ ...f, prn: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select className="input" value={form.blood_group} onChange={e => setForm(f => ({ ...f, blood_group: e.target.value }))}>
                    <option value="">Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <input className="input" placeholder="Batch (e.g. 2023-2027)" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} />
                  <input className="input" placeholder="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-primary">Save Changes</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-200">{profile?.name}</h2>
                  <button onClick={() => setEditing(true)} className="text-xs text-spark-400 hover:text-spark-300">Edit Profile</button>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Mail size={14} /> {profile?.email}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {profile?.position}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card">
        <h3 className="font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <User size={12} /> Name
            </div>
            <p className="text-slate-200 font-medium">{profile?.name || '—'}</p>
          </div>
          <div className="p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Mail size={12} /> Email
            </div>
            <p className="text-slate-200 font-medium">{profile?.email || '—'}</p>
          </div>
          <div className="p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Calendar size={12} /> PRN
            </div>
            <p className="text-slate-200 font-medium">{profile?.prn || '—'}</p>
          </div>
          <div className="p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Droplet size={12} /> Blood Group
            </div>
            <p className="text-slate-200 font-medium">{profile?.blood_group || '—'}</p>
          </div>
          <div className="p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Calendar size={12} /> Batch
            </div>
            <p className="text-slate-200 font-medium">{profile?.batch || '—'}</p>
          </div>
          <div className="p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <GraduationCap size={12} /> Department
            </div>
            <p className="text-slate-200 font-medium">{profile?.department || '—'}</p>
          </div>
        </div>
      </div>

      {/* Account & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-3">Account Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Role</span>
              <span className="text-slate-300 capitalize">{profile?.role || 'Member'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Position</span>
              <span className="text-slate-300 capitalize">{profile?.position || 'Member'}</span>
            </div>
            {profile?.joined_at && (
              <div className="flex justify-between">
                <span className="text-slate-500">Member Since</span>
                <span className="text-slate-300">{new Date(profile.joined_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Performance</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Contribution Score</span>
              <span className="text-emerald-400 font-bold">{profile?.contribution_score || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}