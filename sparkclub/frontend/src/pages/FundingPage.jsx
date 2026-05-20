// frontend/src/pages/FundingPage.jsx
import { useEffect, useState } from 'react';
import { fundingAPI, budgetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, X, MessageSquare, ShieldAlert, CheckCircle, Ban, Calendar, AlertTriangle } from 'lucide-react';

export default function FundingPage() {
  const { user, isTreasurer } = useAuth();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Submit Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: '', description: '', amount: '', category_id: '', priority: 'medium', event_date: ''
  });

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', note: '' });

  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [fRes, cRes] = await Promise.all([
        fundingAPI.getAll({ status: statusFilter, priority: priorityFilter }),
        budgetsAPI.getCategories()
      ]);
      setRequests(fRes.data);
      setCategories(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  function handleOpenSubmit() {
    setSubmitForm({
      title: '', description: '', amount: '',
      category_id: categories[0]?.id || '', priority: 'medium', event_date: ''
    });
    setShowSubmitModal(true);
  }

  async function handleSubmitRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fundingAPI.create({
        ...submitForm,
        amount: Number(submitForm.amount),
        category_id: Number(submitForm.category_id)
      });
      setShowSubmitModal(false);
      loadData();
    } catch (err) {
      alert('Failed to submit funding request.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenReview(reqId) {
    setReviewId(reqId);
    setReviewForm({ status: 'approved', note: '' });
    setShowReviewModal(true);
  }

  async function handleReviewRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fundingAPI.review(reviewId, reviewForm.status, reviewForm.note);
      setShowReviewModal(false);
      loadData();
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to retract this funding request?')) return;
    try {
      await fundingAPI.delete(id);
      loadData();
    } catch (err) {
      alert('Failed to delete request.');
    }
  }

  function getPriorityColor(p) {
    switch (p) {
      case 'urgent': return 'text-red-400 bg-red-950/40 border-red-900';
      case 'high':   return 'text-orange-400 bg-orange-950/40 border-orange-900';
      case 'medium': return 'text-blue-400 bg-blue-950/40 border-blue-900';
      default:       return 'text-slate-400 bg-slate-800/40 border-slate-700';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funding Requests</h1>
          <p className="text-slate-400 text-sm">Submit proposal grants or review active club budget requests</p>
        </div>
        <button onClick={handleOpenSubmit} className="btn-primary flex items-center gap-1">
          <Plus size={16} /> Request Funding
        </button>
      </div>

      {/* Filter panel */}
      <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Status</label>
          <select
            className="input py-1.5"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Priority</label>
          <select
            className="input py-1.5"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button
          onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}
          className="btn-secondary py-2 text-xs"
        >
          Reset Filters
        </button>
      </div>

      {/* Cards Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map(req => (
          <div key={req.id} className="card flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase ${getPriorityColor(req.priority)}`}>
                    {req.priority}
                  </span>
                  <h3 className="font-bold text-slate-200 mt-2 text-base leading-tight">{req.title}</h3>
                </div>
                <span className={`badge-${req.status}`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                {req.description}
              </p>

              {/* Event Date or category indicators */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                {req.event_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>Event: {req.event_date}</span>
                  </span>
                )}
                {req.category_name && (
                  <span className="flex items-center gap-1">
                    <span>{req.category_icon}</span>
                    <span>{req.category_name}</span>
                  </span>
                )}
              </div>

              {/* Review notes if rejected or approved */}
              {req.reviewer_note && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs flex gap-2">
                  <MessageSquare className="text-spark-400 shrink-0 mt-0.5" size={14} />
                  <div>
                    <span className="font-semibold text-slate-300">
                      Reviewer Note ({req.reviewed_by_name}):
                    </span>
                    <p className="text-slate-400 mt-0.5">{req.reviewer_note}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Requested Amount</p>
                <p className="font-extrabold text-slate-100 text-lg">₹{req.amount.toLocaleString('en-IN')}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Delete/Retract if owned by current user & pending */}
                {req.requested_by === user?.id && req.status === 'pending' && (
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 hover:bg-red-950/20 rounded-lg transition-all"
                  >
                    Retract
                  </button>
                )}

                {/* Review button if treasurer and pending */}
                {isTreasurer && (req.status === 'pending' || req.status === 'under_review') && (
                  <button
                    onClick={() => handleOpenReview(req.id)}
                    className="btn-primary py-1.5 px-3 text-xs font-semibold"
                  >
                    Review Request
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {!requests.length && (
          <div className="col-span-full card text-center py-12 text-slate-500">
            No funding requests match your criteria.
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmitRequest} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">New Funding Proposal</h3>
              <button type="button" onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Proposal Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Smart India Hackathon Finals Travel"
                value={submitForm.title}
                onChange={e => setSubmitForm(p => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Proposal Details</label>
              <textarea
                className="input h-24 resize-none"
                placeholder="Describe the scope, events, expected participants, etc..."
                value={submitForm.description}
                onChange={e => setSubmitForm(p => ({ ...p, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Requested Amount (₹)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="15000"
                  value={submitForm.amount}
                  onChange={e => setSubmitForm(p => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Target Date</label>
                <input
                  type="date"
                  className="input"
                  value={submitForm.event_date}
                  onChange={e => setSubmitForm(p => ({ ...p, event_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select
                  className="input"
                  value={submitForm.category_id}
                  onChange={e => setSubmitForm(p => ({ ...p, category_id: e.target.value }))}
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Priority</label>
                <select
                  className="input"
                  value={submitForm.priority}
                  onChange={e => setSubmitForm(p => ({ ...p, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleReviewRequest} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Review Funding Request</h3>
              <button type="button" onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Decision Status</label>
              <select
                className="input"
                value={reviewForm.status}
                onChange={e => setReviewForm(p => ({ ...p, status: e.target.value }))}
                required
              >
                <option value="approved">Approve Funding</option>
                <option value="rejected">Reject Proposal</option>
                <option value="under_review">Mark Under Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Reviewer Note / Feedback</label>
              <textarea
                className="input h-24 resize-none"
                placeholder="State the reason for approval/rejection or requested updates..."
                value={reviewForm.note}
                onChange={e => setReviewForm(p => ({ ...p, note: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submit Review' : 'Save Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
