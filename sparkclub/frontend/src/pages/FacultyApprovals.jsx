// frontend/src/pages/FacultyApprovals.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Check, X, FileCheck, Calendar, Handshake, User, Clock } from 'lucide-react';

export default function FacultyApprovals() {
  const [data, setData] = useState({ fundingRequests: [], eventProposals: [], sponsorshipProposals: [], studentRequests: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('funding');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    facultyAPI.getApprovals({ type: tab })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [tab]);

  async function handleFundingApproval(id, status) {
    setProcessing(id);
    try {
      await facultyAPI.approveFunding(id, status, '');
      const r = await facultyAPI.getApprovals({ type: tab });
      setData(r.data);
    } catch (err) {
      alert('Failed to update approval');
    }
    setProcessing(null);
  }

  async function handleEventApproval(id, status) {
    setProcessing(id);
    try {
      await facultyAPI.approveEvent(id, status);
      const r = await facultyAPI.getApprovals({ type: tab });
      setData(r.data);
    } catch (err) {
      alert('Failed to update event');
    }
    setProcessing(null);
  }

  async function handleSponsorshipApproval(id, stage) {
    setProcessing(id);
    try {
      await facultyAPI.approveSponsorship(id, stage, '');
      const r = await facultyAPI.getApprovals({ type: tab });
      setData(r.data);
    } catch (err) {
      alert('Failed to update sponsorship');
    }
    setProcessing(null);
  }

  const STATUS_COLORS = {
    pending: 'bg-yellow-900/60 text-yellow-300',
    under_review: 'bg-blue-900/60 text-blue-300',
    approved: 'bg-emerald-900/60 text-emerald-300',
    rejected: 'bg-red-900/60 text-red-300'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approval Authority</h1>
          <p className="text-slate-400 text-sm">Review and approve club requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['funding', 'events', 'sponsors', 'students'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {t === 'funding' && 'Funding Requests'}
            {t === 'events' && 'Event Proposals'}
            {t === 'sponsors' && 'Sponsorships'}
            {t === 'students' && 'Student Requests'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {/* Funding Requests */}
          {tab === 'funding' && data.fundingRequests?.map(req => (
            <div key={req.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-200">{req.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{req.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User size={12} /> {req.requested_by_name}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(req.submitted_at)}</span>
                    {req.category_name && <span>Category: {req.category_name}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-spark-400">{formatINR(req.amount)}</p>
                  {req.priority && <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${req.priority === 'urgent' ? 'bg-red-900/60 text-red-300' : req.priority === 'high' ? 'bg-orange-900/60 text-orange-300' : 'bg-slate-800 text-slate-400'}`}>{req.priority}</span>}
                </div>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button onClick={() => handleFundingApproval(req.id, 'approved')} disabled={processing === req.id}
                    className="btn-primary flex items-center gap-1 text-sm py-1">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleFundingApproval(req.id, 'rejected')} disabled={processing === req.id}
                    className="btn-secondary flex items-center gap-1 text-sm py-1">
                    <X size={14} /> Reject
                  </button>
                  <button onClick={() => handleFundingApproval(req.id, 'revision_requested')} disabled={processing === req.id}
                    className="btn-secondary text-sm py-1">Request Revision</button>
                </div>
              )}
            </div>
          ))}

          {/* Event Proposals */}
          {tab === 'events' && data.eventProposals?.map(ev => (
            <div key={ev.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200">{ev.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{ev.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>🎪 {ev.event_type}</span>
                    <span>📍 {ev.venue || 'TBD'}</span>
                    <span>📅 {formatDate(ev.start_date)}</span>
                    {ev.coordinator_name && <span>Coordinator: {ev.coordinator_name}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-spark-400">{formatINR(ev.budget_allocated)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                <button onClick={() => handleEventApproval(ev.id, 'active')} disabled={processing === ev.id}
                  className="btn-primary flex items-center gap-1 text-sm py-1">
                  <Check size={14} /> Approve Event
                </button>
                <button onClick={() => handleEventApproval(ev.id, 'cancelled')} disabled={processing === ev.id}
                  className="btn-secondary flex items-center gap-1 text-sm py-1">
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}

          {/* Sponsorships */}
          {tab === 'sponsors' && data.sponsorshipProposals?.map(sp => (
            <div key={sp.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200">{sp.company_name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/60 text-yellow-300 mt-1 inline-block">{sp.tier}</span>
                  <p className="text-sm text-slate-400 mt-1">Stage: {sp.stage?.replace('_', ' ')}</p>
                  {sp.expected_value && <p className="text-lg font-bold text-emerald-400 mt-2">{formatINR(sp.expected_value)}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                <button onClick={() => handleSponsorshipApproval(sp.id, 'confirmed')} disabled={processing === sp.id}
                  className="btn-primary flex items-center gap-1 text-sm py-1">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => handleSponsorshipApproval(sp.id, 'closed_lost')} disabled={processing === sp.id}
                  className="btn-secondary flex items-center gap-1 text-sm py-1">
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}

          {/* Student Requests */}
          {tab === 'students' && data.studentRequests?.map(req => (
            <div key={req.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200">{req.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{req.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>By: {req.requested_by_name}</span>
                    <span>Type: {req.request_type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-spark-400">{formatINR(req.amount)}</p>
                </div>
              </div>
            </div>
          ))}

          {((tab === 'funding' && !data.fundingRequests?.length) ||
            (tab === 'events' && !data.eventProposals?.length) ||
            (tab === 'sponsors' && !data.sponsorshipProposals?.length) ||
            (tab === 'students' && !data.studentRequests?.length)) && (
            <div className="card text-center py-8 text-slate-500">No pending approvals in this category</div>
          )}
        </div>
      )}
    </div>
  );
}