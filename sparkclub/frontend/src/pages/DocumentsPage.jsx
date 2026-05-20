// frontend/src/pages/DocumentsPage.jsx
import { useEffect, useState } from 'react';
import { documentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, X, FileText, Trash2, Search } from 'lucide-react';

const DOC_TYPES = ['bill','invoice','approval_letter','sponsorship_proposal','event_permission','meeting_minutes','certificate','vendor_quotation','other'];
const TYPE_ICONS = { bill: '🧾', invoice: '📄', approval_letter: '✉️', sponsorship_proposal: '🤝', event_permission: '📋', meeting_minutes: '📝', certificate: '🎓', vendor_quotation: '💰', other: '📎' };

export default function DocumentsPage() {
  const { isTreasurer, isClubHead, isAdmin } = useAuth();
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [docType, setDocType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', doc_type: 'other', file_url: '', tags: '' });
  const [submitting, setSubmitting] = useState(false);

  const canUpload = isTreasurer || isClubHead || isAdmin;

  function load() {
    documentsAPI.getAll({ search, doc_type: docType }).then(r => setDocs(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, docType]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await documentsAPI.create(form);
      setShowModal(false);
      setForm({ title: '', doc_type: 'other', file_url: '', tags: '' });
      load();
    } catch { alert('Failed to add document'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document record?')) return;
    await documentsAPI.delete(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Management</h1>
          <p className="text-slate-400 text-sm">{docs.length} documents</p>
        </div>
        {canUpload && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Document</button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={docType} onChange={e => setDocType(e.target.value)}>
          <option value="">All Types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map(doc => (
            <div key={doc.id} className="card hover:border-slate-700 transition-colors flex items-start gap-3">
              <div className="text-2xl">{TYPE_ICONS[doc.doc_type] || '📎'}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-200 truncate">{doc.title}</h3>
                <p className="text-xs text-slate-500 capitalize mt-0.5">{doc.doc_type?.replace(/_/g, ' ')}</p>
                {doc.tags && <p className="text-xs text-slate-600 mt-1 truncate">Tags: {doc.tags}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-600">by {doc.uploaded_by_name}</span>
                  {canUpload && <button onClick={() => handleDelete(doc.id)} className="text-slate-600 hover:text-red-400 p-0.5"><Trash2 size={12} /></button>}
                </div>
              </div>
            </div>
          ))}
          {!docs.length && <div className="col-span-full card text-center py-12 text-slate-500">No documents found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Add Document</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
            </div>
            <div><label className="block text-sm text-slate-400 mb-1">Title</label><input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Document Type</label>
              <select className="input" value={form.doc_type} onChange={e => setForm(p => ({ ...p, doc_type: e.target.value }))}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div><label className="block text-sm text-slate-400 mb-1">File URL / Reference</label><input className="input" placeholder="https://..." value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))} /></div>
            <div><label className="block text-sm text-slate-400 mb-1">Tags (comma-separated)</label><input className="input" placeholder="finance, techfest, approved" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} /></div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}