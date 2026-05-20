// frontend/src/pages/SponsorshipManagement.jsx
import { useEffect, useState } from 'react';
import { sponsorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, X, Edit3, Trash2 } from 'lucide-react';

const TIER_COLORS = { platinum: 'text-purple-400 border-purple-800 bg-purple-950/20', gold: 'text-yellow-400 border-yellow-800 bg-yellow-950/20', silver: 'text-slate-400 border-slate-600 bg-slate-900/40', bronze: 'text-orange-400 border-orange-800 bg-orange-950/20' };
const STAGE_COLORS = { prospect: 'bg-slate-800 text-slate-400', contacted: 'bg-blue-900/60 text-blue-300', meeting_scheduled: 'bg-indigo-900/60 text-indigo-300', proposal_sent: 'bg-purple-900/60 text-purple-300', negotiation: 'bg-orange-900/60 text-orange-300', confirmed: 'bg-emerald-900/60 text-emerald-300', closed_lost: 'bg-red-900/60 text-red-300' };

export default function SponsorshipManagement() {
  const { isTreasurer, isClubHead, isAdmin } = useAuth();
  const [sponsors, setSponsors]   = useState([]);
  const [pipeline, setPipeline]   = useState([]);
  const [loading, setLoading]    = useState(true);
  const [tab, setTab]             = useState('sponsors');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', tier: 'bronze', total_value: '' });
  const [pipelineForm, setPipelineForm] = useState({ sponsor_id: '', stage: 'prospect', expected_value: '', follow_up_date: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const canEdit = isTreasurer || isClubHead || isAdmin;

  const load = () => {
    Promise.all([sponsorsAPI.getAll(), sponsorsAPI.getPipeline()]).then(([s, p]) => {
      setSponsors(s.data);
      setPipeline(p.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openAddSponsor() {
    setForm({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', tier: 'bronze', total_value: '' });
    setEditingId(null);
    setShowModal(true);
  }

  function openEditSponsor(sp) {
    setForm({
      company_name: sp.company_name,
      contact_name: sp.contact_name || '',
      contact_email: sp.contact_email || '',
      contact_phone: sp.contact_phone || '',
      tier: sp.tier || 'bronze',
      total_value: sp.total_value || ''
    });
    setEditingId(sp.id);
    setShowModal(true);
  }

  async function handleSubmitSponsor(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, total_value: Number(form.total_value) };
      if (editingId) {
        await sponsorsAPI.update(editingId, payload);
      } else {
        await sponsorsAPI.create(payload);
      }
      setShowModal(false);
      setForm({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', tier: 'bronze', total_value: '' });
      setEditingId(null);
      load();
    } catch { alert('Failed to save sponsor'); }
    finally { setSubmitting(false); }
  }

  async function handleSubmitPipeline(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sponsorsAPI.addPipeline({ ...pipelineForm, expected_value: Number(pipelineForm.expected_value), sponsor_id: pipelineForm.sponsor_id || null });
      setShowModal(false);
      setPipelineForm({ sponsor_id: '', stage: 'prospect', expected_value: '', follow_up_date: '', notes: '' });
      load();
    } catch { alert('Failed to add pipeline entry'); }
    finally { setSubmitting(false); }
  }

  async function handleDeleteSponsor(id) {
    if (!confirm('Delete this sponsor?')) return;
    await sponsorsAPI.delete(id);
    load();
  }

  const totalSponsorValue = sponsors.reduce((s, sp) => s + (sp.total_value || 0), 0);
  const closedValue = pipeline.filter(p => p.stage === 'confirmed').reduce((s, p) => s + (p.closed_value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sponsorship Management</h1>
          <p className="text-slate-400 text-sm">{sponsors.length} sponsors · {formatINR(totalSponsorValue)} total value</p>
        </div>
        {canEdit && (
          <button onClick={() => tab === 'sponsors' ? openAddSponsor() : setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add {tab === 'sponsors' ? 'Sponsor' : 'Pipeline Entry'}
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Total Sponsor Value</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{formatINR(totalSponsorValue)}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Closed Revenue</p>
          <p className="text-xl font-bold text-spark-400 mt-1">{formatINR(closedValue)}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Pipeline Entries</p>
          <p className="text-xl font-bold mt-1">{pipeline.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('sponsors')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'sponsors' ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Sponsors</button>
        <button onClick={() => setTab('pipeline')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'pipeline' ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Pipeline</button>
      </div>

      {loading ? <LoadingSpinner /> : tab === 'sponsors' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sponsors.map(sp => (
            <div key={sp.id} className="card hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200">{sp.company_name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border mt-1 inline-block ${TIER_COLORS[sp.tier]}`}>{sp.tier?.toUpperCase()}</span>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => openEditSponsor(sp)} className="text-slate-600 hover:text-spark-400 p-1"><Edit3 size={13} /></button>
                    <button onClick={() => handleDeleteSponsor(sp.id)} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {sp.contact_name && <p className="text-slate-400">{sp.contact_name}</p>}
                {sp.contact_email && <p className="text-slate-500 text-xs">{sp.contact_email}</p>}
                <p className="font-bold text-emerald-400 mt-2">{formatINR(sp.total_value)}</p>
              </div>
            </div>
          ))}
          {!sponsors.length && <div className="col-span-full card text-center py-12 text-slate-500">No sponsors found</div>}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="pb-3 pr-4">Company</th>
                <th className="pb-3 pr-4">Stage</th>
                <th className="pb-3 pr-4 text-right">Expected</th>
                <th className="pb-3 pr-4 text-right">Closed</th>
                <th className="pb-3 pr-4">Follow-up</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {pipeline.map(p => (
                <tr key={p.id} className="hover:bg-slate-900/30">
                  <td className="py-3 pr-4 font-medium text-slate-200">{p.company_name || '—'}</td>
                  <td className="py-3 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[p.stage]}`}>{p.stage?.replace('_',' ')}</span></td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-300">{formatINR(p.expected_value)}</td>
                  <td className="py-3 pr-4 text-right font-mono text-emerald-400">{formatINR(p.closed_value)}</td>
                  <td className="py-3 pr-4 text-slate-500 text-xs">{p.follow_up_date || '—'}</td>
                  <td className="py-3 text-slate-500 text-xs max-w-xs truncate">{p.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pipeline.length && <p className="text-center py-8 text-slate-500">No pipeline entries</p>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          {tab === 'sponsors' ? (
            <form onSubmit={handleSubmitSponsor} className="card w-full max-w-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold">{editingId ? 'Edit' : 'Add'} Sponsor</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
              </div>
              <div><label className="block text-sm text-slate-400 mb-1">Company Name</label><input className="input" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-1">Contact Name</label><input className="input" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Email</label><input className="input" type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-1">Tier</label><select className="input" value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>{['platinum','gold','silver','bronze'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-sm text-slate-400 mb-1">Total Value (₹)</label><input type="number" className="input" value={form.total_value} onChange={e => setForm(p => ({ ...p, total_value: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitPipeline} className="card w-full max-w-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold">Add Pipeline Entry</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
              </div>
              <div><label className="block text-sm text-slate-400 mb-1">Stage</label><select className="input" value={pipelineForm.stage} onChange={e => setPipelineForm(p => ({ ...p, stage: e.target.value }))}>{['prospect','contacted','meeting_scheduled','proposal_sent','negotiation','confirmed','closed_lost'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-1">Expected Value (₹)</label><input type="number" className="input" value={pipelineForm.expected_value} onChange={e => setPipelineForm(p => ({ ...p, expected_value: e.target.value }))} /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Follow-up Date</label><input type="date" className="input" value={pipelineForm.follow_up_date} onChange={e => setPipelineForm(p => ({ ...p, follow_up_date: e.target.value }))} /></div>
              </div>
              <div><label className="block text-sm text-slate-400 mb-1">Notes</label><textarea className="input h-16 resize-none" value={pipelineForm.notes} onChange={e => setPipelineForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}