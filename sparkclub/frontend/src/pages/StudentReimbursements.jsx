// frontend/src/pages/StudentReimbursements.jsx
import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, DollarSign } from 'lucide-react';
import { formatINR, formatDate } from '../utils/format';

export default function StudentReimbursements() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: '', description: '', category_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    studentAPI.getReimbursements()
      .then(r => setClaims(r.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentAPI.submitReimbursement({
        amount: Number(form.amount),
        description: form.description,
        category_id: form.category_id ? Number(form.category_id) : null
      });
      setShowModal(false);
      setForm({ amount: '', description: '', category_id: '' });
      const r = await studentAPI.getReimbursements();
      setClaims(r.data);
    } catch { alert('Failed to submit claim'); }
    setSubmitting(false);
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
          <h1 className="text-2xl font-bold">My Reimbursements</h1>
          <p className="text-slate-400 text-sm">Submit and track your expense claims</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Submit Claim
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-slate-500">Total Submitted</p>
          <p className="text-xl font-bold">{claims.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-xl font-bold text-yellow-400">{claims.filter(c => c.status === 'pending').length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="text-xl font-bold text-emerald-400">{claims.filter(c => c.status === 'approved').length}</p>
        </div>
      </div>

      {/* Claims List */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {claims.map(claim => (
            <div key={claim.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-200">{claim.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{claim.description}</p>
                  <p className="text-xs text-slate-500 mt-2">Submitted: {formatDate(claim.submitted_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-spark-400">{formatINR(claim.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLORS[claim.status]}`}>
                    {claim.status}
                  </span>
                </div>
              </div>
              {claim.reviewer_note && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500">Note: {claim.reviewer_note}</p>
                </div>
              )}
            </div>
          ))}
          {!claims.length && <div className="card text-center py-8 text-slate-500">No reimbursement claims yet</div>}
        </div>
      )}

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Submit Reimbursement</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
              <input type="number" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="What was this expense for?" />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Claim'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}