// frontend/src/pages/SuperAdminSettings.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Settings, User, Shield, Bell, Globe, AlertTriangle, Zap } from 'lucide-react';

export default function SuperAdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyAction, setEmergencyAction] = useState('');
  const [emergencyTarget, setEmergencyTarget] = useState('');
  const [emergencyTargetId, setEmergencyTargetId] = useState('');
  const [emergencyMsg, setEmergencyMsg] = useState('');

  useEffect(() => {
    superadminAPI.getSettings()
      .then(r => setSettings(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleEmergency = async () => {
    if (!emergencyAction || !emergencyTarget || !emergencyTargetId) {
      setEmergencyMsg('Please fill all fields');
      return;
    }
    try {
      await superadminAPI.emergency({ action: emergencyAction, target: emergencyTarget, target_id: emergencyTargetId });
      setEmergencyMsg('Emergency action executed successfully');
      setEmergencyAction('');
      setEmergencyTarget('');
      setEmergencyTargetId('');
    } catch (e) {
      setEmergencyMsg('Failed to execute emergency action');
    }
  };

  if (loading) return <LoadingSpinner />;

  const { profile, platformSettings } = settings || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm">Super admin configuration and controls</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-spark-400" /> Admin Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Name</p>
            <p className="font-medium">{profile?.name || user?.name}</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="font-medium">{profile?.email || user?.email}</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Role</p>
            <p className="font-medium capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" /> Platform Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-4 h-4 ${platformSettings?.aiEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
              <p className="text-xs text-slate-500">AI Assistant</p>
            </div>
            <p className="text-sm font-medium">{platformSettings?.aiEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-4 h-4 ${platformSettings?.requireFacultyApproval ? 'text-yellow-400' : 'text-slate-500'}`} />
              <p className="text-xs text-slate-500">Faculty Approval</p>
            </div>
            <p className="text-sm font-medium">{platformSettings?.requireFacultyApproval ? 'Required' : 'Optional'}</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className={`w-4 h-4 ${platformSettings?.allowNewClubs ? 'text-emerald-400' : 'text-slate-500'}`} />
              <p className="text-xs text-slate-500">New Clubs</p>
            </div>
            <p className="text-sm font-medium">{platformSettings?.allowNewClubs ? 'Allowed' : 'Restricted'}</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-500">Currency</span>
            </div>
            <p className="text-sm font-medium">{platformSettings?.defaultCurrency || 'INR'}</p>
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="card border-red-500/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" /> Emergency Controls
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Execute emergency actions on clubs, users, or events.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={emergencyAction}
              onChange={e => setEmergencyAction(e.target.value)}
              className="input"
            >
              <option value="">Select Action</option>
              <option value="suspend">Suspend</option>
              <option value="activate">Activate</option>
              <option value="delete">Delete</option>
              <option value="lock">Lock</option>
            </select>
            <select
              value={emergencyTarget}
              onChange={e => setEmergencyTarget(e.target.value)}
              className="input"
            >
              <option value="">Select Target</option>
              <option value="club">Club</option>
              <option value="user">User</option>
              <option value="event">Event</option>
            </select>
            <input
              type="number"
              placeholder="Target ID"
              value={emergencyTargetId}
              onChange={e => setEmergencyTargetId(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={handleEmergency}
            className="btn bg-red-600 hover:bg-red-700 text-white"
          >
            Execute Emergency Action
          </button>
          {emergencyMsg && (
            <p className={`text-sm ${emergencyMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
              {emergencyMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}