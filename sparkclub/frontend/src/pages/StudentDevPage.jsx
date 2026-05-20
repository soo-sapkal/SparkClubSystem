// frontend/src/pages/StudentDevPage.jsx
import { useEffect, useState } from 'react';
import { studentdevAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, X } from 'lucide-react';

const TYPE_LABELS = { hackathon_funding: 'Hackathon Funding', travel_grant: 'Travel Grant', workshop_cert: 'Workshop Certificate', mentorship: 'Mentorship Request', project_showcase: 'Project Showcase' };
const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', revision_requested: 'text-xs px-2 py-0.5 rounded-full bg-orange-900/60 text-orange-300 border border-orange-800' };

export default function StudentDevPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ request_type: 'hackathon_funding', title: '', description: '', amount: '', event_name: '', event_date: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    studentdevAPI.getAll().then(r => setRequests(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentdevAPI.create({ ...form, amount: Number(form.amount) });
      setShowModal(false);
      setForm({ request_type: 'hackathon_funding', title: '', description: '', amount: '', event_name: '', event_date: '' });
      studentdevAPI.getAll().then(r => setRequests(r.data));
    } catch { alert('Failed to submit request'); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Development</h1>
          <p className="text-slate-400 text-sm">Hackathon funding, travel grants, mentorship requests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Apply for Support</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-spark-900/40 text-spark-300 border border-spark-800">{TYPE_LABELS[req.request_type] || req.request_type}</span>
                    <span className={STATUS_COLORS[req.status] || 'badge-pending'}>{req.status?.replace('_',' ')}</span>
                  </div>
                  <h3 className="font-semibold text-slate-200 mt-1">{req.title}</h3>
                  {req.description && <p className="text-sm text-slate-400 mt-1">{req.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    {req.event_name && <span>Event: {req.event_name}</span>}
                    {req.event_date && <span>Date: {req.event_date}</span>}
                    <span>Submitted: {formatDate(req.submitted_at)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-spark-400 text-lg">{formatINR(req.amount)}</p>
                  {req.reviewer_note && <p className="text-xs text-slate-500 mt-1 max-w-[200px] text-right">Note: {req.reviewer_note}</p>}
                </div>
              </div>
            </div>
          ))}
          {!requests.length && <div className="card text-center py-12 text-slate-500">No requests submitted yet</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Apply for Student Support</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Request Type</label>
              <select className="input" value={form.request_type} onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="block text-sm text-slate-400 mb-1">Title</label><input className="input" placeholder="SIH Finals Travel Grant" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            <div><label className="block text-sm text-slate-400 mb-1">Description</label><textarea className="input h-20 resize-none" placeholder="Details about the event, participation, etc." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-400 mb-1">Amount (₹)</label><input type="number" className="input" placeholder="5000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Event Date</label><input type="date" className="input" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} /></div>
            </div>
            <div><label className="block text-sm text-slate-400 mb-1">Event Name</label><input className="input" placeholder="Smart India Hackathon 2026" value={form.event_name} onChange={e => setForm(p => ({ ...p, event_name: e.target.value }))} /></div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}