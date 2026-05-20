// frontend/src/pages/FacultySettings.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { User, Bell, Shield, AlertTriangle, Power, Pause, Ban, ArrowUpRight } from 'lucide-react';

export default function FacultySettings() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [applyingControl, setApplyingControl] = useState(null);

  useEffect(() => {
    facultyAPI.getSettings()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  async function applyEmergencyControl(action) {
    setApplyingControl(action);
    try {
      await facultyAPI.emergencyControl(action);
      alert(`Emergency control "${action}" applied successfully`);
    } catch (err) {
      alert('Failed to apply emergency control');
    }
    setApplyingControl(null);
  }

  if (loading) return <LoadingSpinner />;

  const { profile, settings, emergencyControls } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your profile and controls</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'emergency', label: 'Emergency Controls', icon: AlertTriangle }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === tab.id ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Faculty Profile</h2>
          <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-lg">
            <div className="w-16 h-16 bg-spark-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
              {user?.avatar || user?.name?.[0] || 'F'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-200">{user?.name}</h3>
              <p className="text-slate-400">{user?.email}</p>
              <span className="text-xs px-2 py-0.5 bg-purple-900/60 text-purple-300 rounded-full mt-1 inline-block">Faculty Coordinator</span>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Threshold breach alerts', desc: 'Get notified when spending exceeds budget thresholds' },
              { label: 'Suspicious transaction alerts', desc: 'Alert for unusual or suspicious expenses' },
              { label: 'Pending approvals', desc: 'Daily summary of pending approval requests' },
              { label: 'Delayed reimbursements', desc: 'Notify when reimbursements are pending over 7 days' },
              { label: 'Policy violation alerts', desc: 'Immediate alerts for policy violations' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div>
                  <p className="text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spark-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Controls Tab */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <div className="card border-red-900/50">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Emergency Controls</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">High authority interventions. Use with caution.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button onClick={() => applyEmergencyControl('freeze_spending')}
                disabled={applyingControl}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-900/30 transition-colors text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Power className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Freeze Club Spending</span>
                </div>
                <p className="text-xs text-slate-500">Block all new transactions and expenses</p>
              </button>

              <button onClick={() => applyEmergencyControl('freeze_reimbursement')}
                disabled={applyingControl}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-900/30 transition-colors text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Pause className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Freeze Reimbursements</span>
                </div>
                <p className="text-xs text-slate-500">Pause all reimbursement processing</p>
              </button>

              <button onClick={() => applyEmergencyControl('block_vendors')}
                disabled={applyingControl}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-900/30 transition-colors text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Block Vendors</span>
                </div>
                <p className="text-xs text-slate-500">Prevent payments to specific vendors</p>
              </button>

              <button onClick={() => applyEmergencyControl('require_faculty_approval')}
                disabled={applyingControl}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-900/30 transition-colors text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Require Faculty Approval</span>
                </div>
                <p className="text-xs text-slate-500">All approvals require faculty sign-off</p>
              </button>

              <button onClick={() => applyEmergencyControl('pause_approvals')}
                disabled={applyingControl}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-900/30 transition-colors text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Pause className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Pause All Approvals</span>
                </div>
                <p className="text-xs text-slate-500">Temporarily halt all approval workflows</p>
              </button>

              <button onClick={() => applyEmergencyControl('escalate_to_admin')}
                disabled={applyingControl}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-900/30 transition-colors text-left">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Escalate to Super Admin</span>
                </div>
                <p className="text-xs text-slate-500">Report club issues to super administrator</p>
              </button>
            </div>
          </div>

          {/* Current Status */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Current Status</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg text-center ${emergencyControls?.spendingFrozen ? 'bg-red-900/30' : 'bg-slate-900/30'}`}>
                <Power className={`w-6 h-6 mx-auto mb-2 ${emergencyControls?.spendingFrozen ? 'text-red-400' : 'text-slate-500'}`} />
                <p className="text-sm text-slate-400">Spending</p>
                <p className={`font-medium ${emergencyControls?.spendingFrozen ? 'text-red-400' : 'text-emerald-400'}`}>
                  {emergencyControls?.spendingFrozen ? 'Frozen' : 'Active'}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${emergencyControls?.reimbursementPaused ? 'bg-red-900/30' : 'bg-slate-900/30'}`}>
                <Pause className={`w-6 h-6 mx-auto mb-2 ${emergencyControls?.reimbursementPaused ? 'text-red-400' : 'text-slate-500'}`} />
                <p className="text-sm text-slate-400">Reimbursements</p>
                <p className={`font-medium ${emergencyControls?.reimbursementPaused ? 'text-red-400' : 'text-emerald-400'}`}>
                  {emergencyControls?.reimbursementPaused ? 'Paused' : 'Active'}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${emergencyControls?.approvalsBlocked ? 'bg-red-900/30' : 'bg-slate-900/30'}`}>
                <Shield className={`w-6 h-6 mx-auto mb-2 ${emergencyControls?.approvalsBlocked ? 'text-red-400' : 'text-slate-500'}`} />
                <p className="text-sm text-slate-400">Approvals</p>
                <p className={`font-medium ${emergencyControls?.approvalsBlocked ? 'text-red-400' : 'text-emerald-400'}`}>
                  {emergencyControls?.approvalsBlocked ? 'Blocked' : 'Open'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}